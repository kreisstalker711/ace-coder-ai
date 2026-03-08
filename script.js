async function generateCode() {

  const promptInput = document.getElementById("prompt");
  const outputBox = document.getElementById("output");

  const prompt = promptInput.value;

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  outputBox.textContent = "Generating code...";

  try {

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: prompt })
    });

    const data = await response.json();

    if (data.result) {
      outputBox.textContent = data.result;
    } else {
      outputBox.textContent = "Error generating code.";
    }

  } catch (error) {
    outputBox.textContent = "Server error. Please try again.";
    console.error(error);
  }
}