import React, { useState } from "react";
import api from "../../api/client.js";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickServices = [
    {
      icon: "📊",
      title: "Crop Prices",
      prompt: "Show me the latest crop and mandi prices."
    },
    {
      icon: "📈",
      title: "Market Trends",
      prompt: "Explain the current market price trends."
    },
    {
      icon: "🛒",
      title: "Sell Produce",
      prompt: "How can I list and sell my produce on KrishiLink?"
    },
    {
      icon: "🏪",
      title: "Find Buyers",
      prompt: "Help me find suitable buyers for my produce."
    },
    {
      icon: "🎯",
      title: "Buyer Match",
      prompt: "How does KrishiLink match farmers with buyers?"
    },
    {
      icon: "📦",
      title: "My Produce",
      prompt: "Help me manage my listed produce on KrishiLink."
    }
  ];

  const allServices = [
    ...quickServices,
    {
      icon: "🚚",
      title: "Logistics",
      prompt: "Help me with transportation and logistics."
    },
    {
      icon: "🏬",
      title: "Storage",
      prompt: "Help me find storage options for my produce."
    },
    {
      icon: "💰",
      title: "Offers",
      prompt: "Explain how buyer offers work on KrishiLink."
    },
    {
      icon: "🤝",
      title: "Transactions",
      prompt: "Help me understand my transactions on KrishiLink."
    },
    {
      icon: "📋",
      title: "Schemes",
      prompt: "Tell me about agriculture government schemes."
    },
    {
      icon: "🌾",
      title: "Crop Advice",
      prompt: "Give me practical advice about my crop."
    },
    {
      icon: "👤",
      title: "My Account",
      prompt: "Help me with my KrishiLink account."
    },
    {
      icon: "❓",
      title: "Get Help",
      prompt: "I need help using KrishiLink."
    }
  ];

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! 👋 I'm your KrishiLink Assistant. I can help you with crop prices, buyers, selling, market trends and more."
    }
  ]);

  const sendMessage = async (customMessage = "") => {
    const message = (customMessage || input).trim();

    if (!message || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: message
      }
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat", {
        message
      });

      const reply =
        response.data?.data?.reply ||
        response.data?.reply ||
        "Sorry, I couldn't find an answer for that.";

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: reply
        }
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I couldn't process your request. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([
      {
        role: "bot",
        text: "Hello! 👋 I'm your KrishiLink Assistant. How can I help you today?"
      }
    ]);

    setInput("");
    setShowAll(false);
  };

  const services = showAll ? allServices : quickServices;

  if (!isOpen) {
    return (
      <button
        className="chatbot-launcher"
        onClick={() => setIsOpen(true)}
        aria-label="Open KrishiLink Assistant"
      >
        🌱
      </button>
    );
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="assistant">
          <div className="assistant-logo">🌱</div>
          <div>
            <h2>KrishiLink Assistant</h2>
            <p>Smart farming support 24/7</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="new-chat" onClick={newChat}>
            ↻ New Chat
          </button>
          <button
            className="close-chat"
            onClick={() => setIsOpen(false)}
            aria-label="Close Chat"
          >
            ×
          </button>
        </div>
      </div>

      <div className="chatbot-main">
        <div className="section-title">
          <span>How can I help?</span>
          <small>Quick actions</small>
        </div>

        <div className="services">
          {services.map((service) => (
            <button
              key={service.title}
              className="service"
              onClick={() => sendMessage(service.prompt)}
              disabled={loading}
            >
              <span className="service-icon">{service.icon}</span>
              <span className="service-title">{service.title}</span>
            </button>
          ))}
        </div>

        <button
          className="view-services"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "↑ Show fewer services" : "▦ View all services"}
        </button>

        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "message-user" : "message-bot"
              }`}
            >
              {message.text}
            </div>
          ))}

          {loading && (
            <div className="message message-bot typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        <div className="smart-suggestions">
          <button
            onClick={() => sendMessage("What is the current wheat price?")}
            disabled={loading}
          >
            🌾 Wheat price
          </button>
          <button
            onClick={() => sendMessage("How can I find a buyer?")}
            disabled={loading}
          >
            🏪 Find buyer
          </button>
          <button
            onClick={() => sendMessage("How can I sell my produce?")}
            disabled={loading}
          >
            🛒 Sell produce
          </button>
        </div>

        <div className="app-tip">
          <span>💡</span>
          <div>
            <strong>Pro tip:</strong> Ask me about crop prices, buyers, selling, market trends and more.
          </div>
        </div>
      </div>

      <div className="chat-input-area">
        <button className="mic" type="button" aria-label="Voice input">
          🎙
        </button>
        <input
          type="text"
          value={input}
          placeholder="Ask about prices, buyers, crops..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          disabled={loading}
        />
        <button
          className="send"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
