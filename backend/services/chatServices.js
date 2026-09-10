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
    return "Please tell me what you need help with.";
  }

  const systemInstruction = `
You are KrishiLink Assistant, an intelligent AI assistant for an agricultural marketplace platform in India.

KrishiLink connects farmers, buyers and FPOs and helps them with:
- Crop and mandi prices
- Market trends
- Selling agricultural produce
- Finding suitable buyers
- Buyer-produce matching
- Produce listings and lots
- Quality and grading
- Buyer offers
- Logistics and transportation
- Storage
- Transactions and payments
- Agriculture government schemes
- General crop-related guidance

Your job is to give practical, simple and useful answers.

Rules:
1. Be helpful and conversational.
2. Keep answers easy to understand for Indian farmers.
3. Use Indian Rupees (₹) when discussing money.
4. Do not invent live crop prices, buyer information, government scheme details or market data.
5. If the user asks for live/current data that is not provided to you, clearly say that live data needs to be checked from KrishiLink's market data.
6. If the question is about KrishiLink features, explain how the platform can help.
7. If the user asks something unrelated to agriculture or KrishiLink, politely answer briefly or guide them back to the platform.
8. Never claim that a transaction, buyer match, payment or booking has actually happened unless the application confirms it.
9. For financial decisions, provide general information and mention that prices can change.
10. Prefer short structured answers with bullets when useful.
11. Speak naturally and do not repeatedly introduce yourself as an AI.
`;

  const client = getAIClient();

  if (client) {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    try {
      const response = await client.models.generateContent({
        model,
        contents: message,
        config: {
          systemInstruction,
        },
      });

      if (response?.text) {
        return response.text;
      }
    } catch (error) {
      console.warn(`Gemini generation unavailable (${error?.status || error?.message || "error"}), using agricultural assistant fallback.`);
    }
  }

  // Fallback to domain-aware intelligent responder
  return getRuleBasedResponse(message);
}