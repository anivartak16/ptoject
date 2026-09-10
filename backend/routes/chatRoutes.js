import express from "express";
<<<<<<< HEAD
import { generateChatResponse } from "../services/intelligence.js";
=======
import { generateChatResponse } from "../services/chatServices.js";
>>>>>>> 719931bac6b098f0ff68f6a02fb3be01dceb4af8

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

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 719931bac6b098f0ff68f6a02fb3be01dceb4af8
