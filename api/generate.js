import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { prompt } = req.body;

    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert coding assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-70b-8192"
    });

    res.status(200).json({
      result: chat.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "AI request failed"
    });

  }

}