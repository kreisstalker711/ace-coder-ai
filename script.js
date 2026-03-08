const input = document.getElementById("prompt");
const button = document.getElementById("generate");
const output = document.getElementById("output");

button.onclick = async () => {

  const prompt = input.value;

  if (!prompt) return;

  output.innerHTML = "Generating...";

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt
    })
  });

  const data = await res.json();

  output.innerText = data.result;

};