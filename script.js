const input = document.getElementById("prompt");
const button = document.getElementById("generate");
const output = document.getElementById("output");

let chatHistory = [];

button.onclick = async () => {

  const prompt = input.value;

  if (!prompt) return;

  // show user message
  output.innerHTML += `<div class="user">You: ${prompt}</div>`;

  chatHistory.push({
    role: "user",
    content: prompt
  });

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: chatHistory
    })
  });

  const data = await res.json();

  const reply = data.result;

  // show AI reply
  output.innerHTML += `<div class="ai">AI: ${reply}</div>`;

  chatHistory.push({
    role: "assistant",
    content: reply
  });

  input.value = "";
};