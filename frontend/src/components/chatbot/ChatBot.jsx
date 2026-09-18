import React, { useState, useRef, useEffect } from "react";
import api from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import {
  MessageSquare,
  X,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

export function ChatBot() {
  const { language, t, getLabel } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        language === "hi"
          ? "नमस्ते! 👋 मैं KrishiLink कृषि सहायक हूँ। मंडी भाव, नेट रियलाइजेशन (शुद्ध मुनाफा), खरीदार मैचिंग और फसल बिक्री में मैं आपकी सहायता कर सकता हूँ।"
          : language === "mr"
          ? "नमस्कार! 👋 मी तुमचा KrishiLink कृषी सहाय्यक आहे. बाजार भाव, थेट खरेदीदार, शेतमाल विक्री व शासकीय योजनांमध्ये मी मदत करू शकतो."
          : "Hello! 👋 I'm your KrishiLink Assistant. I can help you with live mandi prices, net realization, buyer matching, fake offer protection, and selling advice.",
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async (customMessage = "") => {
    const message = (customMessage || input).trim();
    if (!message || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat", {
        message,
      });

      const reply =
        response.data?.data?.reply ||
        response.data?.reply ||
        (language === "hi"
          ? "क्षमा करें, इस विषय पर अभी जानकारी उपलब्ध नहीं है।"
          : "Sorry, I couldn't find an answer for that.");

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            language === "hi"
              ? "सर्वर से कनेक्ट करने में समस्या हुई। कृपया दोबारा प्रयास करें अथवा Dashboard पर मंडी भाव देखें।"
              : "Sorry, I couldn't connect to the assistant server. Please check your connection or view prices on the Dashboard.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([
      {
        role: "bot",
        text:
          language === "hi"
            ? "नमस्ते! नई बातचीत शुरू हुई। आप किस फसल या सेवा के बारे में जानना चाहते हैं?"
            : "Hello! New conversation started. What can I help you with today?",
      },
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
            <p>{getLabel("Smart Farming & Market Support 24/7", "24/7 स्मार्ट कृषि व मंडी सहायता", "२४/७ स्मार्ट कृषी सहाय्यक")}</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="new-chat" onClick={newChat} title="Reset Chat">
            <RotateCcw size={13} />
            <span>Reset</span>
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
        {/* Quick Suggestion Chips */}
        <div className="services-container">
          <div className="section-title">
            <span>{getLabel("Quick Inquiries", "त्वरित विषय", "जलद विषय")}</span>
            <small>{getLabel("Instant Answers", "तुरंत उत्तर", "त्वरित उत्तरे")}</small>
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
            type="button"
            className="view-services"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? getLabel("↑ Show fewer topics", "↑ कम विषय दिखाएं", "↑ कमी विषय")
              : getLabel("▦ View all agricultural topics", "▦ सभी कृषि विषय देखें", "▦ सर्व विषय पहा")}
          </button>
        </div>

        {/* Messages Feed */}
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "message-user" : "message-bot"
              }`}
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
            onClick={() => sendMessage(language === "hi" ? "गेहूं का ताजा मंडी भाव क्या है?" : "What is the current wheat mandi rate?")}
            disabled={loading}
          >
            🌾 {getLabel("Wheat Price", "गेहूं भाव", "गहू दर")}
          </button>
          <button
            onClick={() => sendMessage(language === "hi" ? "नेट रियलाइजेशन कैलकुलेट करके बताएं।" : "How is net realisation calculated?")}
            disabled={loading}
          >
            💰 {getLabel("Net Realisation", "नेट मुनाफा", "निव्वळ प्राप्ती")}
          </button>
          <button
            onClick={() => sendMessage(language === "hi" ? "फेक ऑफर की पहचान कैसे करें?" : "How to identify fake offers?")}
            disabled={loading}
          >
            🛡️ {getLabel("Fake Offers", "फेक ऑफर", "संशयास्पद ऑफर")}
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          placeholder={getLabel(
            "Ask about prices, net profit, buyers, crop advice...",
            "मंडी भाव, शुद्ध मुनाफा, खरीदार, फसल सलाह पूछें...",
            "बाजार भाव, नफा, खरेदीदार, पीक सल्ला विचारा..."
          )}
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
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
