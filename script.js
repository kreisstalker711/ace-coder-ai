// send prompt to AI
async function sendPrompt() {

const promptBox = document.getElementById("prompt");
const messages = document.getElementById("messages");
const emptyState = document.getElementById("emptyState");

const prompt = promptBox.value.trim();

if (!prompt) return;

// remove empty screen
if (emptyState) emptyState.remove();

// show user message
addMessage(prompt, "user");

promptBox.value = "";

// temporary AI thinking message
addMessage("Thinking...", "assistant");

try {

const response = await fetch("/api/generate", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ prompt })
});

const data = await response.json();

// remove thinking message
messages.lastChild.remove();

// show AI response
addMessage(data.result || "No response from AI.", "assistant");

} catch (error) {

messages.lastChild.remove();
addMessage("⚠️ Error contacting AI server.", "assistant");
console.error(error);

}

}


// add message to chat
function addMessage(text, role) {

const messages = document.getElementById("messages");

const message = document.createElement("div");
message.className = `message ${role}`;

message.innerHTML = `
<div class="avatar ${role === "user" ? "user-avatar" : "ace-avatar"}">
${role === "user" ? "U" : "AI"}
</div>

<div class="message-body">
<div class="message-role">${role}</div>
<div class="message-content">${text}</div>
</div>
`;

messages.appendChild(message);

// auto scroll
messages.scrollTop = messages.scrollHeight;

}


// optional: send message with Enter key
document.addEventListener("keydown", function(e) {

if (e.key === "Enter" && !e.shiftKey) {

const promptBox = document.getElementById("prompt");

if (document.activeElement === promptBox) {
e.preventDefault();
sendPrompt();
}

}

});