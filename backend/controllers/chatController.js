import { generateChatResponse } from "../services/chatServices.js";

export async function chat(req, res) {
  try {
    const { message, history, language = "en", isQuickAction = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const reply = await generateChatResponse({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      language: ["en", "hi", "mr"].includes(language) ? language : "en",
      isQuickAction: Boolean(isQuickAction)
    });

    return res.json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate chatbot response"
    });
  }
}