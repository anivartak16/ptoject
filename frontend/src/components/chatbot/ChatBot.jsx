import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { X, Send } from "lucide-react";
import api from "../../api/client.js";

export function ChatBot() {
  const { language, getLabel } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick Services with exact original titles and prompts
  const quickServices = [
    {
      icon: "📊",
      title: getLabel("Crop Rates", "मंडी भाव", "बाजार भाव"),
      prompt: language === "hi" ? "आज का गेहूं और सोयाबीन का मंडी भाव बताएं।" : "Show me the latest crop and mandi prices.",
    },
    {
      icon: "💰",
      title: getLabel("Net Realisation", "शुद्ध मुनाफा", "निव्वळ प्राप्ती"),
      prompt: language === "hi" ? "नेट रियलाइजेशन क्या है और किसान का मुनाफा कैसे निकलता है?" : "Explain Net Realisation and how farmer take-home earnings are calculated.",
    },
    {
      icon: "📈",
      title: getLabel("Sell or Hold?", "बेचें या रोकें?", "विका की ठेवा?"),
      prompt: language === "hi" ? "क्या अभी फसल बेचना सही है या वेयरहाउस में रखें (Sell vs Hold)?" : "Should I sell my crop now or hold it in storage?",
    },
    {
      icon: "🛡️",
      title: getLabel("Fake Offers", "फेक ऑफर सुरक्षा", "संशयास्पद खरेदी"),
      prompt: language === "hi" ? "फर्जी और संदिग्ध खरीदार ऑफर से किसान कैसे बचें?" : "How does KrishiLink protect farmers from fake buyer offers?",
    },
    {
      icon: "🛒",
      title: getLabel("Sell Produce", "फसल कैसे बेचें", "शेतमाल कसा विकावा"),
      prompt: language === "hi" ? "KrishiLink पर अपनी फसल कैसे लिस्ट करें?" : "How can I list and sell my produce on KrishiLink?",
    },
    {
      icon: "🏪",
      title: getLabel("Find Buyers", "खरीदार खोजें", "खरेदीदार शोधा"),
      prompt: language === "hi" ? "व्यापारी और खरीदार कैसे खोजें?" : "Help me find suitable buyers for my produce.",
    },
  ];

  const allServices = [
    ...quickServices,
    {
      icon: "🤝",
      title: getLabel("FPO Matching", "FPO मैचिंग", "FPO जुळवणी"),
      prompt: language === "hi" ? "FPO सामूहिक बिक्री और मैचिंग कैसे काम करता है?" : "How does FPO collective selling and buyer matching work?",
    },
    {
      icon: "🚚",
      title: getLabel("Logistics", "परिवहन / भाड़ा", "वाहतूक व्यवस्था"),
      prompt: language === "hi" ? "परिवहन और वाहन बुकिंग कैसे करें?" : "Help me with transportation and logistics.",
    },
    {
      icon: "🏬",
      title: getLabel("Storage", "वेयरहाउस भंडारण", "गोदाम साठवणूक"),
      prompt: language === "hi" ? "वेयरहाउस और कोल्ड स्टोरेज कैसे बुक करें?" : "Help me find storage options for my produce.",
    },
    {
      icon: "📋",
      title: getLabel("Govt Schemes", "सरकारी योजनाएं", "शासकीय योजना"),
      prompt: language === "hi" ? "PM-KISAN और फसल बीमा योजना के बारे में बताएं।" : "Tell me about agriculture government schemes like PM-KISAN and PMFBY.",
    },
  ];

  const getInitialGreeting = () => {
    if (language === "mr") {
      return "नमस्कार! 👋 मी आपला KrishiLink सहाय्यक आहे. मी आपल्याला बाजार भाव, खरेदीदार, शेतमाल विक्री, बाजार कल आणि अधिक बाबींमध्ये मदत करू शकतो.";
    }
    if (language === "hi") {
      return "नमस्ते! 👋 मैं आपका KrishiLink सहायक हूँ। मैं फसल भाव, खरीदार, बिक्री, बाजार रुझान और अन्य जानकारियों में आपकी मदद कर सकता हूँ।";
    }
    return "Hello! 👋 I'm your KrishiLink Assistant. I can help you with crop prices, buyers, selling, market trends and more.";
  };

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: getInitialGreeting()
    }
  ]);

  // Update initial greeting when language changes (if no conversation yet)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ role: "bot", text: getInitialGreeting() }];
      }
      return prev;
    });
  }, [language]);

  // Auto-scroll on new messages or loading state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      const history = messages.slice(-10).map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text
      }));

      const response = await api.post("/chat", {
        message,
        history,
        language,
        isQuickAction: false
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
          text:
            language === "mr"
              ? "क्षमस्व, विनंतीवर प्रक्रिया करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
              : language === "hi"
              ? "क्षमा करें, आपके अनुरोध पर कार्रवाई करने में समस्या आई। कृपया पुनः प्रयास करें।"
              : "Sorry, I couldn't process your request. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeTextMessage = () => {
    sendMessage();
  };

  const newChat = () => {
    setMessages([
      {
        role: "bot",
        text: getInitialGreeting()
      }
    ]);
    setInput("");
    setShowAll(false);
  };

  const renderMessageContent = (text) => {
    // Simple markdown-style renderer for bold and bullets
    const lines = text.split("\n");
    return lines.map((line, i) => {
      let content = line;
      // Bold text **word**
      const boldParts = content.split(/(\*\*.*?\*\*)/g);
      const formattedParts = boldParts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <div key={i} className={`msg-line ${line.startsWith("•") ? "bullet" : ""}`}>
          {formattedParts}
        </div>
      );
    });
  };

  const services = showAll ? allServices : quickServices;

  if (!isOpen) {
    return (
      <button
        className="chatbot-launcher"
        onClick={() => setIsOpen(true)}
        aria-label="Open KrishiLink Assistant"
        title="KrishiLink AI Assistant"
      >
        <span className="launcher-icon">🌱</span>
        <span className="launcher-badge">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="chatbot animate-scaleIn">
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
            <X size={18} />
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

        {/* Messages Feed */}
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "message-user" : "message-bot"
              }`}
              style={{ whiteSpace: "pre-line" }}
            >
              {renderMessageContent(message.text)}
            </div>
          ))}

          {loading && (
            <div className="message message-bot typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Smart Prompt Shortcuts */}
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

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          placeholder="Ask about prices, buyers, crops..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleFreeTextMessage();
            }
          }}
          disabled={loading}
        />
        <button
          className="send"
          onClick={() => handleFreeTextMessage()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
