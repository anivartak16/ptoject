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
  const q = (message || "").toLowerCase().trim();

  // 1. Greetings (English, Hindi, Marathi, Hinglish)
  if (/^(hi|hello|hey|namaste|namaskar|pranam|ram ram|kisan)/i.test(q)) {
    return (
      "🌾 **नमस्ते / Hello! मैं KrishiLink कृषि सहायक हूँ।**\n\n" +
      "मैं आपकी इन विषयों में सहायता कर सकता हूँ:\n\n" +
      "• **Mandi Prices & Trends:** लाइव मंडी भाव, न्यूनतम समर्थन मूल्य (MSP) और 30-दिन के रुझान\n" +
      "• **Net Realisation:** भाड़ा (transport) और मंडी शुल्क काटकर किसान को मिलने वाली शुद्ध कमाई\n" +
      "• **Price Opportunity Alert:** फसल को अभी बेचें (Sell) या भंडारण में रखें (Hold) की सलाह\n" +
      "• **Fake Offer Detection:** संदिग्ध खरीदारों और फर्जी ऑफर से बचाव व एस्क्रो सुरक्षा\n" +
      "• **Buyer Matching:** खरीदार मांग (Demands) और एफपीओ लॉट का मिलान\n" +
      "• **Quality & Testing:** कृषि विज्ञान केंद्र (KVK) से गुणवत्ता परीक्षण व ग्रेडिंग\n" +
      "• **Govt Schemes:** PM-KISAN, PM फसल बीमा और e-NAM की जानकारी\n\n" +
      "आप क्या जानना चाहते हैं? (उदा. 'गेहूं का भाव', 'फसल कैसे बेचें', 'नेट रियलाइजेशन क्या है?')"
    );
  }

  // 2. Net Realisation (User question: "Net Realisation kya hai", "actual kitna milega", etc.)
  if (
    q.includes("realisation") ||
    q.includes("realization") ||
    q.includes("net") ||
    q.includes("actual") ||
    q.includes("profit") ||
    q.includes("kamai") ||
    q.includes("kharch")
  ) {
    return (
      "💰 **नेट रियलाइजेशन (Net Realisation) क्या है और यह क्यों जरूरी है?**\n\n" +
      "मंडी में केवल ग्रॉस भाव (Gross Price) देखना काफी नहीं होता। वास्तविक किसान कमाई जानने के लिए:\n\n" +
      "**फार्मूला:**\n" +
      "`नेट रियलाइजेशन = ग्रॉस बिक्री मूल्य - (परिवहन/भाड़ा + मंडी शुल्क 1.5% + भंडारण/हैंडलिंग)`\n\n" +
      "**उदाहरण:**\n" +
      "• ग्रॉस भाव: ₹2,600 / क्विंटल (₹26/किग्रा)\n" +
      "• परिवहन खर्च (25 किमी): ₹120 / क्विंटल\n" +
      "• मंडी शुल्क व हैंडलिंग: ₹50 / क्विंटल\n" +
      "• **किसान की वास्तविक कमाई (Net Return):** ₹2,430 / क्विंटल (₹24.30/किग्रा)\n\n" +
      "KrishiLink के **Dashboard** और **Offers** पेज पर 'Net Realisation Calculator' से आप अपनी हर फसल का वास्तविक मुनाफा तुरंत देख सकते हैं!"
    );
  }

  // 3. Price Opportunity Alert (Sell vs Hold)
  if (
    q.includes("alert") ||
    q.includes("sell") && q.includes("hold") ||
    q.includes("beche") ||
    q.includes("roke") ||
    q.includes("opportunity") ||
    q.includes("kya kare")
  ) {
    return (
      "📈 **प्राइस ऑपर्च्युनिटी अलर्ट (Sell vs. Hold Guide):**\n\n" +
      "KrishiLink का एल्गोरिदम 30-दिन के औसत मूल्य और सरकारी MSP की तुलना करके अलर्ट देता है:\n\n" +
      "🟢 **SELL NOW (अभी बेचें):**\n" +
      "जब वर्तमान मंडी भाव 30-दिन के औसत से +5% ऊपर हो और खरीदार मांग उच्च हो, तब फसल बेचना सबसे लाभकारी होता है।\n\n" +
      "🟡 **HOLD IN STORAGE (भंडारण में रखें):**\n" +
      "जब आवक अधिक होने से भाव गिरे हों (-4% या अधिक), तब 2 से 3 सप्ताह KrishiLink वेयरहाउस में भंडारण करके मूल्य सुधार का इंतजार करें।\n\n" +
      "Dashboard पर 'Price Opportunity Alert' कार्ड में अपने जिले की फसल के लिए लाइव सिग्नल देखें।"
    );
  }

  // 4. Fake Offer Detection & Buyer Verification
  if (
    q.includes("fake") ||
    q.includes("fraud") ||
    q.includes("suspicious") ||
    q.includes("verified") ||
    q.includes("scam") ||
    q.includes("suraksha") ||
    q.includes("escrow")
  ) {
    return (
      "🛡️ **फेक ऑफर डिटेक्शन और खरीदार सत्यापन (Buyer Verification):**\n\n" +
      "KrishiLink किसानों को धोखाधड़ी से बचाने के लिए 3 सुरक्षा स्तर लागू करता है:\n\n" +
      "1. **सत्यापित खरीदार (Verified Buyer):** केवल GSTIN, पैन और मंडी लाइसेंस सत्यापित व्यापारियों को हरा (Green Shield) बैज मिलता है।\n" +
      "2. **संदिग्ध मूल्य चेतावनी (Fake Offer Warning):** यदि कोई अपंजीकृत खरीदार मंडी भाव से 35% से अधिक अवास्तविक ऊंची बोली लगाता है, तो सिस्टम **'🚨 High Risk Offer Alert'** जारी करता है।\n" +
      "3. **100% एस्क्रो भुगतान (Agri-Escrow):** खरीदार को सौदा पक्का होते ही पूरी राशि एस्क्रो खाते में जमा करनी होती है। माल डिलीवरी और किसान की पुष्टि के बाद ही भुगतान ट्रांसफर होता है।"
    );
  }

  // 5. Mandi Rates, Bhav & MSP
  if (
    q.includes("price") ||
    q.includes("bhav") ||
    q.includes("भाव") ||
    q.includes("rate") ||
    q.includes("दर") ||
    q.includes("दाम") ||
    q.includes("mandi") ||
    q.includes("मंडी") ||
    q.includes("बाजार") ||
    q.includes("msp") ||
    q.includes("gehu") ||
    q.includes("गेहूं") ||
    q.includes("गेहू") ||
    q.includes("wheat") ||
    q.includes("chana") ||
    q.includes("चना") ||
    q.includes("soyabean") ||
    q.includes("soybean") ||
    q.includes("सोयाबीन") ||
    q.includes("धान") ||
    q.includes("paddy") ||
    q.includes("सरसों") ||
    q.includes("mustard")
  ) {
    return (
      "📊 **मंडी भाव व सरकारी MSP 2024-25 (PAN-INDIA):**\n\n" +
      "• **गेहूं (Wheat):** MSP ₹2,275/क्विंटल (मंडी रेंज: ₹2,400 – ₹2,750/क्विंटल)\n" +
      "• **सोयाबीन (Soybean):** MSP ₹4,892/क्विंटल (मंडी रेंज: ₹4,300 – ₹4,750/क्विंटल)\n" +
      "• **चना (Gram/Chana):** MSP ₹5,440/क्विंटल (मंडी रेंज: ₹5,600 – ₹6,200/क्विंटल)\n" +
      "• **धान (Paddy):** MSP ₹2,300/क्विंटल (मंडी रेंज: ₹2,250 – ₹2,550/क्विंटल)\n" +
      "• **सरसों (Mustard):** MSP ₹5,650/क्विंटल (मंडी रेंज: ₹5,200 – ₹5,800/क्विंटल)\n\n" +
      "अपने नजदीकी मंडी के लाइव दैनिक भाव देखने के लिए **Mandi Prices** मेन्यू पर जाएं।"
    );
  }

  // 6. FPO Matching & Aggregation
  if (
    q.includes("fpo") ||
    q.includes("matching") ||
    q.includes("aggregate") ||
    q.includes("dal") ||
    q.includes("ekattar")
  ) {
    return (
      "🤝 **FPO मैचिंग और एकत्रीकरण (Collective Selling):**\n\n" +
      "• **Farmer Pool:** अपने FPO में सदस्य किसानों को जोड़ें।\n" +
      "• **Lot Aggregation:** छोटे किसानों की 500-1000 किग्रा की उपज को मिलाकर 10-50 टन का बड़ा लॉट बनाएं।\n" +
      "• **Explainable Matching:** FPO मैचिंग सेक्शन में खरीदार मांग (Demands) से मात्रा, गुणवत्ता, दूरी और मूल्य के आधार पर 100-पॉइंट स्कोरिंग होती है।\n" +
      "• **Direct Proposal:** FPO सीधे खरीदार को आपूर्ति प्रस्ताव (Supply Proposal) भेज सकते हैं।"
    );
  }

  // 7. Selling Produce
  if (
    q.includes("sell") ||
    q.includes("lot") ||
    q.includes("produce") ||
    q.includes("list") ||
    q.includes("bech")
  ) {
    return (
      "🛒 **KrishiLink पर फसल कैसे बेचें?**\n\n" +
      "1. अपने किसान या FPO खाते में लॉगिन करें।\n" +
      "2. **'My Lots'** में जाएं और **'Register New Crop Lot'** पर क्लिक करें।\n" +
      "3. फसल का नाम, कुल मात्रा (किग्रा), अपेक्षित दर (₹/किग्रा) और भंडारण स्थान भरें।\n" +
      "4. KVK जांच हेतु भेजें अथवा सीधे बाजार में लाइव करें।\n" +
      "5. सत्यापित खरीदार सीधे आपके लॉट पर बोली (Offers) लगाएंगे।"
    );
  }

  // 8. Buyer Demand
  if (
    q.includes("buy") ||
    q.includes("demand") ||
    q.includes("order") ||
    q.includes("purchase") ||
    q.includes("kharid")
  ) {
    return (
      "🏪 **खरीदार मांग (Buyer Demands):**\n\n" +
      "खरीदार अपनी विशिष्ट आवश्यकता दर्ज कर सकते हैं:\n" +
      "• फसल की किस्म (उदा. Sharbati Wheat, Lokwan)\n" +
      "• आवश्यक मात्रा (क्विंटल/टन)\n" +
      "• गुणवत्ता ग्रेड (Grade A, अधिकतम 12% नमी)\n" +
      "• डिलीवरी स्थान व अधिकतम बजट (₹/किग्रा)\n\n" +
      "सिस्टम तुरंत नजदीकी किसानों व FPO लॉट्स के साथ मैचिंग प्रदान करता है।"
    );
  }

  // 9. Logistics & Transport
  if (
    q.includes("transport") ||
    q.includes("logistics") ||
    q.includes("vehicle") ||
    q.includes("truck") ||
    q.includes("bhada")
  ) {
    return (
      "🚚 **परिवहन व लॉजिस्टिक्स सहायता:**\n\n" +
      "• सौदा पक्का होने पर KrishiLink के 'Logistics' सेक्शन से सत्यापित वाहन बुक करें।\n" +
      "• पिकअप और डिलीवरी स्थान डालकर दूरी के आधार पर पारदर्शी प्रति-किमी भाड़ा तय होता है।\n" +
      "• जीपीएस ट्रैकिंग द्वारा माल पहुंचने तक लाइव अपडेट मिलता है।"
    );
  }

  // 10. Storage / Warehouse
  if (
    q.includes("storage") ||
    q.includes("warehouse") ||
    q.includes("godown") ||
    q.includes("cold")
  ) {
    return (
      "🏬 **गोदाम व भंडारण (Warehousing):**\n\n" +
      "• यदि अभी भाव कम हैं तो अपनी फसल नजदीकी सत्यापित वेयरहाउस में सुरक्षित रखें।\n" +
      "• दैनिक प्रति-यूनिट दर पर क्षमता बुक करें ताकि नमी या कीटों से नुकसान न हो।"
    );
  }

  // 11. Schemes
  if (
    q.includes("scheme") ||
    q.includes("yojana") ||
    q.includes("pm-kisan") ||
    q.includes("subsidy") ||
    q.includes("bima")
  ) {
    return (
      "📋 **प्रमुख कृषि सरकारी योजनाएं:**\n\n" +
      "• **PM-KISAN:** ₹6,000 प्रति वर्ष (₹2,000 की तीन किस्तें) सीधे बैंक खाते में।\n" +
      "• **PM फसल बीमा योजना (PMFBY):** प्राकृतिक आपदाओं से फसल नुकसान पर न्यूनतम प्रीमियम पर बीमा।\n" +
      "• **किसान क्रेडिट कार्ड (KCC):** खाद, बीज और कृषि उपकरणों हेतु 4% रियायती ब्याज दर पर ऋण।\n" +
      "• **e-NAM:** देश की 1,300+ मंडियों से ऑनलाइन व्यापार की सुविधा।"
    );
  }

  return (
    "धन्यवाद! KrishiLink पर आप लाइव मंडी भाव, खरीदार मैचिंग, नेट रियलाइजेशन (शुद्ध मुनाफा) और फसल बिक्री की पूरी सहायता प्राप्त कर सकते हैं।\n\n" +
    "कृपया फसल का नाम बताएं या अपना प्रश्न लिखें (उदा. 'सोयाबीन का भाव', 'फसल कैसे बेचें', 'फेक ऑफर से बचाव')।"
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