import express from "express";
import { generateChatResponse } from "../services/chatServices.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, history = [], language = "en", isQuickAction = false } = req.body;

    // Validate message
    if (!message || (typeof message === "string" && !message.trim())) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const cleanMsg = typeof message === "string" ? message.trim() : String(message);

    // Generate response (handles both quick actions and natural AI conversation)
    const reply = await generateChatResponse({
      message: cleanMsg,
      history: Array.isArray(history) ? history : [],
      language: ["en", "hi", "mr"].includes(language) ? language : "en",
      isQuickAction: Boolean(isQuickAction),
    });

    return res.status(200).json({
      success: true,
      data: {
        reply,
      },
      reply, // Support both response.data.reply and response.data.data.reply
    });
  } catch (error) {
    console.error("Chat route error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate AI response",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
