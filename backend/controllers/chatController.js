import { generateChatResponse } from "../services/chatService.js";

export async function chat(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const reply = await generateChatResponse(message);

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