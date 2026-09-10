import express from "express";
import { generateChatResponse } from "../services/chatServices.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await generateChatResponse(message);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chat route error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate AI response",
    });
  }
});

export default router;
