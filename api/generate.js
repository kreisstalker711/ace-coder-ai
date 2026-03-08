import Groq from "groq-sdk";

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt } = req.body;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI coding assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return res.status(200).json({
      result: completion.choices[0].message.content
    });

  } catch (error) {

    console.error("ERROR:", error);

    return res.status(500).json({
      error: "Server error"
    });

  }

}