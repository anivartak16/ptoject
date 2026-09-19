import { GoogleGenAI } from "@google/genai";

let aiClient = null;

function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    } catch (err) {
      console.warn("Could not initialize GoogleGenAI client:", err.message);
    }
  }
  return aiClient;
}

function getRuleBasedResponse(message) {
  const q = (message || "").toLowerCase();

  if (/^(hi|hello|hey|namaste|pranam)/i.test(q.trim())) {
    return (
      "Namaste! I am your KrishiLink Assistant. I can help you with:\n\n" +
      "• Checking live mandi prices and price trends\n" +
      "• Listing your crop lots for sale\n" +
      "• Finding buyer demands and automated matching\n" +
      "• Quality grading and Krishi Kendra inspection\n" +
      "• Arranging logistics and warehouse storage\n" +
      "• Information on agricultural government schemes\n\n" +
      "How can I assist you today?"
    );
  }

  if (q.includes("price") || q.includes("bhav") || q.includes("rate") || q.includes("mandi")) {
    return (
      "To check current mandi prices and 30-day trends:\n\n" +
      "1. Go to the **Mandi Prices** section on the dashboard.\n" +
      "2. Select your crop (e.g., Wheat, Soybean, Onion, Potato) and nearest mandi (e.g., Indore, Dewas, Ujjain, Bhopal).\n" +
      "3. You can see minimum, maximum, and modal prices along with trend indicators (UP/DOWN/STABLE).\n\n" +
      "Always check the net realized price after considering transport costs before choosing where to sell."
    );
  }

  if (q.includes("sell") || q.includes("lot") || q.includes("produce") || q.includes("list")) {
    return (
      "To sell your agricultural produce on KrishiLink:\n\n" +
      "1. Login to your **Farmer** or **FPO** dashboard.\n" +
      "2. Click **Create New Lot**.\n" +
      "3. Enter the crop name, quantity (in kg/quintals), harvest date, and expected price (₹).\n" +
      "4. Once listed, verified buyers can view your lot and submit offers directly to you.\n" +
      "5. You can accept or counter offers with full escrow-backed payment security."
    );
  }

  if (q.includes("buy") || q.includes("demand") || q.includes("order") || q.includes("purchase")) {
    return (
      "For buyers and traders looking to purchase crops:\n\n" +
      "1. Login with your **Buyer** account.\n" +
      "2. Create a **Demand** specifying the required commodity, quantity, maximum budget (₹/kg), and preferred location.\n" +
      "3. KrishiLink's explainable matching engine will automatically rank available farmer and FPO lots based on quality, distance, and price compatibility.\n" +
      "4. Submit offers directly to the farmers."
    );
  }

  if (q.includes("quality") || q.includes("grade") || q.includes("moisture") || q.includes("inspection") || q.includes("kendra")) {
    return (
      "Quality verification on KrishiLink:\n\n" +
      "• Krishi Kendras and certified inspectors evaluate grain moisture percentage, foreign matter, and defect rates.\n" +
      "• Lots receive quality grades (such as Grade A or Grade B).\n" +
      "• Verified quality lots receive a verified badge, which gives buyers higher confidence and helps farmers secure premium rates."
    );
  }

  if (q.includes("transport") || q.includes("logistics") || q.includes("vehicle") || q.includes("truck")) {
    return (
      "Logistics support:\n\n" +
      "• Once an offer is accepted and a transaction is created, you can book verified transport through KrishiLink's Logistics section.\n" +
      "• Transporters provide vehicle type options (e.g., Mini Truck, Heavy Truck) and transparent per-km rates.\n" +
      "• Real-time milestone tracking keeps both buyer and seller updated until delivery."
    );
  }

  if (q.includes("storage") || q.includes("warehouse") || q.includes("cold storage")) {
    return (
      "Warehouse and storage services:\n\n" +
      "• Browse nearby dry warehouses and cold storage facilities with transparent daily per-unit rates.\n" +
      "• Book available capacity to store crops safely until market rates improve."
    );
  }

  if (q.includes("scheme") || q.includes("pm-kisan") || q.includes("yojana") || q.includes("subsidy") || q.includes("fasal bima")) {
    return (
      "Key government schemes for Indian farmers:\n\n" +
      "• **PM-KISAN**: ₹6,000/year direct financial benefit delivered in three equal installments of ₹2,000.\n" +
      "• **PM Fasal Bima Yojana (PMFBY)**: Low-cost crop insurance protecting against yield loss from natural disasters.\n" +
      "• **Kisan Credit Card (KCC)**: Low-interest institutional credit for seeds, fertilizers, and agricultural implements.\n" +
      "• **e-NAM**: National Agriculture Market linking mandis for pan-India electronic trading.\n\n" +
      "Visit your local Krishi Kendra or the official pmkisan.gov.in portal for enrollment details."
    );
  }

  return (
    "Thank you for contacting KrishiLink Assistant. As an agricultural marketplace, " +
    "we connect farmers, FPOs, and buyers with transparent mandi rates, direct trading, " +
    "verified quality inspections, and reliable logistics.\n\n" +
    "Feel free to ask about mandi prices, how to list your harvest, buyer matching, or government schemes!"
  );
}

export async function generateChatResponse(message) {
  if (!message || !message.trim()) {
    if (language === "mr") return "कृपया आपल्याला काय मदत हवी आहे ते सांगा.";
    if (language === "hi") return "कृपया बताएं कि आपको किस विषय में सहायता चाहिए।";
    return "Please tell me what you need help with.";
  }

  const cleanMsg = message.trim();
  const langKey = ["en", "hi", "mr"].includes(language) ? language : "en";
  const dict = predefinedResponses[langKey] || predefinedResponses.en;

  // --------------------------------------------------
  // 1. EXISTING QUICK ACTION CHECK
  // If flagged as quick action or matches a known quick action prompt:
  // Return the existing predefined response immediately.
  // --------------------------------------------------
  const quickKey = matchQuickActionKey(cleanMsg);
  if (isQuickAction && quickKey && dict[quickKey]) {
    return dict[quickKey];
  }
  if (quickKey && dict[quickKey]) {
    return dict[quickKey];
  }

  // --------------------------------------------------
  // 2. FREE-TEXT QUESTION -> AI BACKEND
  // --------------------------------------------------
  const langNames = {
    en: "English",
    hi: "Hindi (हिंदी)",
    mr: "Marathi (मराठी)"
  };

  const currentLangName = langNames[langKey] || "English";

  const systemInstruction = `
You are KrishiLink Assistant, an intelligent AI assistant for KrishiLink, India's National Digital Agri Marketplace platform.

==================================================
CRITICAL LANGUAGE ENFORCEMENT RULE:
The user has chosen their website language as: ${currentLangName} (${langKey}).
You MUST write your entire response strictly in ${currentLangName}.
- If language is 'hi', respond in clear, natural Hindi.
- If language is 'mr', respond in authentic, fluent Marathi.
- If language is 'en', respond in clear English.
The user might ask their question in English, Hindi, Marathi, Hinglish (e.g. "Buyer kaise find karu?"), or mixed words.
Regardless of the input wording, your final response MUST be written exclusively in ${currentLangName}.
==================================================

Platform Knowledge & Context:
- Platform: KrishiLink connects Indian farmers, FPOs, and institutional buyers directly with transparent mandi prices, digital quality testing, and bank escrow payments.
- MSP (Minimum Support Price): Government floor price for 23 crops. Compare local prices against MSP on KrishiLink.
- Selling & Lots: Farmers/FPOs create lots with crop type, quantity, expected price, and submit them for Krishi Kendra testing before listing.
- Buying & Demands: Buyers post procurement demands. KrishiLink's explainable matching engine pairs lots based on distance, quantity, quality, and price.
- Quality Testing: Local district Krishi Kendras physically test moisture (<12%), purity, and defects, issuing Grade A/B certificates.
- Mandi Prices: Live arrivals and modal rates across 520+ APMC mandis synced from AGMARKNET. Always calculate Net Realisation (mandi rate minus transport/storage costs).
- Market Prediction: AI and mathematical forecasting models giving BUY, SELL, HOLD, or WAIT signals.
- Logistics: Book GPS-tracked trucks with per-km rates directly on the platform.
- Storage: Certified dry warehouses and cold storage booking.
- KYC: 12-digit Aadhaar mock verification with 6-digit OTP gives the green "Verified ✓" trust badge.
- Escrow: 100% payment held in bank escrow and released on delivery verification.
- Schemes: PM-KISAN (₹6000/yr), PMFBY (crop insurance), KCC (credit card), e-NAM.

Rules:
1. Be direct, natural, conversational, and helpful to Indian farmers and traders.
2. If the user asks a follow-up question (e.g. "Should I sell it?", "What about Indore?"), use the conversation history to understand the context.
3. Use Indian Rupees (₹) and metric units (kg, quintal).
4. Keep answers concise, clear, and easy to read.
`;

  const client = getAIClient();

  if (client) {
    // Try candidate models in order of availability
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-2.5-pro",
    ];

    // Build multi-turn conversation history
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item.role === "user" && item.text) {
          contents.push({ role: "user", parts: [{ text: item.text }] });
        } else if (item.role === "bot" && item.text) {
          contents.push({ role: "model", parts: [{ text: item.text }] });
        }
      }
    }
    contents.push({ role: "user", parts: [{ text: cleanMsg }] });

    for (const model of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });

        if (response?.text && response.text.trim()) {
          return response.text.trim();
        }
      } catch (err) {
        // Continue to next candidate model if 503 or unavailable
        console.warn(`Model ${model} unavailable (${err?.status || err?.message || "error"}), trying next model...`);
      }
    }
  }

  // --------------------------------------------------
  // 3. ROBUST DOMAIN FALLBACK (If AI API is unreachable)
  // Provides natural, accurate answers instead of a blank screen
  // --------------------------------------------------
  return getDomainFallback(cleanMsg, langKey, history);
}