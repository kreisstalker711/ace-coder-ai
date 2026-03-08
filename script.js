/* ═══════════════════════════════════════════
   AceCoder AI — script.js
   ═══════════════════════════════════════════ */

// ── DOM References ────────────────────────
const promptInput   = document.getElementById('promptInput');
const sendBtn       = document.getElementById('sendBtn');
const messagesEl    = document.getElementById('messages');
const loadingWrapper= document.getElementById('loadingWrapper');
const emptyState    = document.getElementById('emptyState');
const charCount     = document.getElementById('charCount');
const clearBtn      = document.getElementById('clearBtn');

// ── State ─────────────────────────────────
let conversation = [];
let isLoading    = false;

// ── Auto-resize textarea ──────────────────
promptInput.addEventListener('input', () => {
  promptInput.style.height = 'auto';
  promptInput.style.height = Math.min(promptInput.scrollHeight, 200) + 'px';
  const len = promptInput.value.length;
  charCount.textContent = `${len.toLocaleString()} / 8,000`;
  sendBtn.disabled = len === 0 || isLoading;
});

// ── Send on Enter (Shift+Enter for newline) ─
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage();
  }
});

// ── Send Button ───────────────────────────
sendBtn.addEventListener('click', sendMessage);

// ── Clear Button ──────────────────────────
clearBtn.addEventListener('click', () => {
  conversation = [];
  messagesEl.innerHTML = '';
  emptyState.style.display = 'flex';
  promptInput.value = '';
  promptInput.style.height = 'auto';
  charCount.textContent = '0 / 8,000';
  sendBtn.disabled = true;
});

// ── Suggestion Items ──────────────────────
document.querySelectorAll('.suggestion-item').forEach(btn => {
  btn.addEventListener('click', () => {
    promptInput.value = btn.dataset.prompt;
    promptInput.dispatchEvent(new Event('input'));
    promptInput.focus();
  });
});

// ── Empty State Chips ─────────────────────
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    promptInput.value = chip.textContent;
    promptInput.dispatchEvent(new Event('input'));
    promptInput.focus();
  });
});

// ── Nav Pills (cosmetic) ──────────────────
document.querySelectorAll('.nav-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// ══════════════════════════════════════════
// CORE: Send Message
// ══════════════════════════════════════════
async function sendMessage() {
  const text = promptInput.value.trim();
  if (!text || isLoading) return;

  // Hide empty state
  emptyState.style.display = 'none';

  // Add user message to UI
  appendMessage('user', text);

  // Add to conversation history
  conversation.push({ role: 'user', content: text });

  // Reset input
  promptInput.value = '';
  promptInput.style.height = 'auto';
  charCount.textContent = '0 / 8,000';
  sendBtn.disabled = true;

  // Show loading
  setLoading(true);

  try {
    const reply = await fetchFromAPI(conversation);
    appendMessage('assistant', reply);
    conversation.push({ role: 'assistant', content: reply });
  } catch (err) {
    appendMessage('assistant', `⚠️ **Error:** ${err.message}\n\nPlease check your API configuration and try again.`);
  } finally {
    setLoading(false);
  }
}

// ══════════════════════════════════════════
// API Call → /api/generate
// ══════════════════════════════════════════
async function fetchFromAPI(messages) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      system: `You are AceCoder AI (nickname: Ace), an expert programming assistant with deep knowledge across all programming languages, frameworks, and software engineering best practices.

When responding:
- Write clean, well-commented, production-ready code
- Use clear markdown formatting with fenced code blocks and language labels
- Explain your reasoning when useful
- Point out potential edge cases or improvements
- Be concise but thorough
- Format code examples with the language name after the opening triple backtick (e.g. \`\`\`python)`,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.content || data.text || data.message || '';
}

// ══════════════════════════════════════════
// Render Message
// ══════════════════════════════════════════
function appendMessage(role, content) {
  const isUser = role === 'user';

  const msg = document.createElement('div');
  msg.className = `message ${role}`;

  const avatarEl = document.createElement('div');
  avatarEl.className = `avatar ${isUser ? 'user-avatar' : 'ace-avatar'}`;

  if (isUser) {
    avatarEl.textContent = 'You';
  } else {
    avatarEl.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
        <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="url(#mHex)" stroke-width="1.5"/>
        <text x="14" y="18.5" text-anchor="middle" font-family="Syne" font-size="11" font-weight="800" fill="url(#mText)">Ac</text>
        <defs>
          <linearGradient id="mHex" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#818CF8"/>
          </linearGradient>
          <linearGradient id="mText" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#818CF8"/>
          </linearGradient>
        </defs>
      </svg>`;
  }

  const body = document.createElement('div');
  body.className = 'message-body';

  const roleLabel = document.createElement('div');
  roleLabel.className = 'message-role';
  roleLabel.textContent = isUser ? 'You' : 'Ace';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.innerHTML = parseMarkdown(content);

  body.appendChild(roleLabel);
  body.appendChild(contentEl);
  msg.appendChild(avatarEl);
  msg.appendChild(body);
  messagesEl.appendChild(msg);

  // Syntax highlight all code blocks in this message
  contentEl.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });

  // Attach copy buttons
  contentEl.querySelectorAll('.code-wrapper').forEach(wrapper => {
    const btn = wrapper.querySelector('.copy-btn');
    const code = wrapper.querySelector('code');
    if (btn && code) {
      btn.addEventListener('click', () => copyCode(btn, code.textContent));
    }
  });

  scrollToBottom();
}

// ══════════════════════════════════════════
// Markdown Parser (lightweight)
// ══════════════════════════════════════════
function parseMarkdown(text) {
  // Escape HTML first
  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

  // Process fenced code blocks FIRST (before other transforms)
  const codeBlocks = [];
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const language = lang || 'plaintext';
    const safeCode = code.trim().replace(/[&<>]/g, c => escapeMap[c]);
    codeBlocks.push(`
      <div class="code-wrapper">
        <div class="code-header">
          <span class="code-lang">${language}</span>
          <button class="copy-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>
        <pre><code class="language-${language}">${safeCode}</code></pre>
      </div>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Inline code
  text = text.replace(/`([^`]+)`/g, (_, code) => {
    const safe = code.replace(/[&<>]/g, c => escapeMap[c]);
    return `<code>${safe}</code>`;
  });

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headers
  text = text.replace(/^### (.+)$/gm, '<h4 style="color:#E8EDF5;font-family:var(--font-display);margin:14px 0 6px;font-size:15px;">$1</h4>');
  text = text.replace(/^## (.+)$/gm,  '<h3 style="color:#E8EDF5;font-family:var(--font-display);margin:16px 0 8px;font-size:17px;">$1</h3>');
  text = text.replace(/^# (.+)$/gm,   '<h2 style="color:#E8EDF5;font-family:var(--font-display);margin:18px 0 10px;font-size:20px;">$1</h2>');

  // Unordered lists
  text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, match => `<ul style="margin:8px 0;padding-left:20px;color:var(--text-secondary);">${match}</ul>`);

  // Ordered lists
  text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs (split by double newline)
  const parts = text.split(/\n\n+/);
  text = parts.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<') || p.startsWith('%%CODE')) return p;
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    text = text.replace(`%%CODEBLOCK_${i}%%`, block);
  });

  return text;
}

// ══════════════════════════════════════════
// Copy Code
// ══════════════════════════════════════════
function copyCode(btn, code) {
  navigator.clipboard.writeText(code).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy`;
    }, 2000);
  });
}

// ── Loading State ─────────────────────────
function setLoading(state) {
  isLoading = state;
  loadingWrapper.style.display = state ? 'block' : 'none';
  sendBtn.disabled = state || promptInput.value.trim().length === 0;
  if (state) scrollToBottom();
}

// ── Scroll to Bottom ──────────────────────
function scrollToBottom() {
  const chatArea = document.querySelector('.chat-area');
  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

// ── Init ──────────────────────────────────
promptInput.focus();