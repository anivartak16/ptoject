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

// ============================================================================
// 1. PREDEFINED / QUICK-ACTION RESPONSES (EN, HI, MR)
// Restores all original quick services with complete multilingual support
// ============================================================================
export const predefinedResponses = {
  en: {
    crop_prices:
      "📊 **Current Mandi Prices & Comparison**\n\n" +
      "• **Wheat (Lokwan / Sharbati)**: ₹2,450 – ₹2,680 / qtl (Indore Mandi: UP 2.1%)\n" +
      "• **Soybean (Yellow)**: ₹4,720 – ₹4,980 / qtl (Dewas Mandi: STABLE)\n" +
      "• **Gram / Chana**: ₹5,800 – ₹6,150 / qtl (Ujjain Mandi: UP 1.4%)\n" +
      "• **Mustard**: ₹5,200 – ₹5,450 / qtl (Bhopal Mandi: STABLE)\n\n" +
      "💡 *Tip: Go to **Mandi Prices** in your navigation to view real-time arrivals, price spreads across 520+ mandis, and net realization calculations.*",

    market_trends:
      "📈 **Market Trends & Seasonality Insights**\n\n" +
      "• **Soybean**: High crushing demand from solvent extraction plants. Prices expected to hold firm above ₹4,800/qtl.\n" +
      "• **Wheat**: Strong procurement demand. Model predicts a +4.2% price rise over the next 30 days due to festival stock-building.\n" +
      "• **Pulses (Chana/Tur)**: Supply remains tight; government buffer procurement is lending strong price support.\n\n" +
      "💡 *Tip: Check **Price Predictions** on your dashboard for machine learning forecasting with 7-day, 15-day, and 30-day confidence intervals.*",

    net_realisation:
      "💰 **Understanding Net Realisation (शुद्ध मुनाफा)**\n\n" +
      "Gross Mandi Price does not equal take-home farmer profit! Always calculate your **Net Realisation**:\n\n" +
      "**Net Realisation Formula:**\n" +
      "`Net Earnings = Mandi Gross Rate - (Transport Cost + Loading/Unloading + Mandi Cess + Weighing + Moisture Deduction)`\n\n" +
      "• Example: Mandi A offers ₹2,550/qtl at 60km (₹85/qtl transport).\n" +
      "• Mandi B offers ₹2,510/qtl at 10km (₹20/qtl transport).\n" +
      "• **Mandi B yields higher net cash in hand (₹2,490 vs ₹2,465)!**\n\n" +
      "💡 *Use KrishiLink's **Net Realisation Calculator** to compare net profits automatically.*",

    sell_or_hold:
      "📈 **Sell vs Hold Decision Framework**\n\n" +
      "Should you sell your harvest today or hold it in storage?\n\n" +
      "1. **Hold if:** Predicted 45-day price gain exceeds warehouse rent (₹0.25/qtl/day) + interest cost.\n" +
      "2. **Sell if:** Moisture content is high (>14%) and safe dry storage is unavailable, or local prices are currently at 90-day highs.\n" +
      "3. **KrishiLink Recommendation:** For Wheat, holding for 30–45 days in certified storage is projected to yield an extra ₹140–180/qtl after storage costs.",

    fake_offers:
      "🛡️ **Fake & Suspicious Offer Protection**\n\n" +
      "How KrishiLink protects you from fraudulent buyers:\n\n" +
      "• **100% Escrow Guarantee**: Buyers must deposit 100% of order value into a secured bank escrow account before dispatch.\n" +
      "• **Verified Badges**: Always look for the green **Verified ✓** badge and **Aadhaar/GSTIN verified** tags.\n" +
      "• **Outlier Price Detection**: Offers with unrealistically high prices (+30% above market) without escrow backing are automatically flagged as suspicious.\n" +
      "• **Zero Cash Risk**: Never release grain until you receive an in-app SMS/notification confirming escrow deposit.",

    sell_produce:
      "🛒 **How to Sell Produce on KrishiLink**\n\n" +
      "Follow these 5 simple steps to sell directly to verified buyers:\n\n" +
      "1. **Login** to your Farmer or FPO account.\n" +
      "2. Click **My Lots** → **Create New Lot**.\n" +
      "3. Enter the commodity, quantity (kg), harvest date, and expected price.\n" +
      "4. Submit a sample for **Krishi Vigyan Kendra (KVK)** quality testing to earn a Grade A verified badge.\n" +
      "5. Receive direct offers from institutional buyers and accept with 100% escrow protection.",

    find_buyers:
      "🏪 **Finding Buyers & Procurement Demands**\n\n" +
      "• Navigate to **Buyer Demands** in your menu to view active purchase orders from verified millers, exporters, and retailers.\n" +
      "• Filter demands by commodity, maximum distance, and minimum offer price.\n" +
      "• Use **Buyer Matching** to see buyers whose procurement requirements match your available lots.",

    buyer_match:
      "🤝 **KrishiLink Buyer Matching Engine**\n\n" +
      "KrishiLink uses an explainable multi-factor matching engine that pairs your lots with the best buyers:\n\n" +
      "• **Quality Compatibility (35%)**: Matches buyer grade specs with your lab test results.\n" +
      "• **Distance & Logistics (25%)**: Prioritizes nearby buyers to minimize freight charges.\n" +
      "• **Price Alignment (25%)**: Matches expected price with buyer procurement budget.\n" +
      "• **Counterparty Trust Score (15%)**: Favors verified buyers with on-time escrow release history.",

    my_produce:
      "🌾 **Managing Your Listed Produce (My Lots)**\n\n" +
      "• Go to **My Lots** to view all your active, certified, and pending harvest lots.\n" +
      "• View your digital Kisan Smart Card and quality lab test reports.\n" +
      "• Edit expected rates or mark lots as sold when transactions complete.",

    logistics:
      "🚚 **Logistics & Transportation Coordination**\n\n" +
      "• Book GPS-tracked agricultural transport directly from the **Logistics** section.\n" +
      "• Choose vehicle capacity: 1-ton pickup, 5-ton mini truck, or 16-ton heavy carrier.\n" +
      "• Transparent per-km rates with real-time pickup and delivery milestone tracking.",

    storage:
      "🏬 **Warehouse & Cold Storage Discovery**\n\n" +
      "• Discover WDRA-accredited dry warehouses and cold storages nearby.\n" +
      "• View transparent daily per-quintal rates (typically ₹0.20 – ₹0.35/qtl/day).\n" +
      "• Deposit produce to receive **electronic Negotiable Warehouse Receipts (e-NWR)** for low-interest bank pledge financing.",

    schemes:
      "📋 **Key Agricultural Government Schemes**\n\n" +
      "• **PM-KISAN**: ₹6,000 per year in 3 equal installments of ₹2,000 directly into Aadhaar-seeded bank accounts.\n" +
      "• **PM Fasal Bima Yojana (PMFBY)**: Subsidized crop insurance against drought, unseasonal rains, and pests (1.5% - 2% premium).\n" +
      "• **Kisan Credit Card (KCC)**: Crop loans up to ₹3 Lakh at an effective 4% interest rate.\n" +
      "• **e-NAM**: National Agriculture Market connecting 1,360+ mandis for inter-state trading.",
  },

  hi: {
    crop_prices:
      "📊 **मंडी भाव एवं मूल्य तुलना**\n\n" +
      "• **गेहूं (लोकवन / शरबती)**: ₹2,450 – ₹2,680 / क्विंटल (इंदौर मंडी: +2.1% तेज)\n" +
      "• **सोयाबीन (पीला)**: ₹4,720 – ₹4,980 / क्विंटल (देवास मंडी: स्थिर)\n" +
      "• **चना / दाल**: ₹5,800 – ₹6,150 / क्विंटल (उज्जैन मंडी: +1.4% तेज)\n" +
      "• **सरसों**: ₹5,200 – ₹5,450 / क्विंटल (भोपाल मंडी: स्थिर)\n\n" +
      "💡 *सलाह: 520+ मंडियों के लाइव भाव और शुद्ध मुनाफा जांचने के लिए नेविगेशन में **मंडी भाव** विकल्प देखें।*",

    market_trends:
      "📈 **बाजार रुझान एवं आवक विश्लेषण**\n\n" +
      "• **सोयाबीन**: तेल मिलों और सॉल्वेंट प्लांटों की मजबूत मांग से भाव ₹4,800 से ऊपर बने रहने का अनुमान है।\n" +
      "• **गेहूं**: सरकारी और निजी खरीद के कारण आगामी 30 दिनों में +4.2% की तेजी का अनुमान है।\n" +
      "• **दलहन (चना/तुअर)**: बाजार में आवक सीमित होने से भाव मजबूत बने हुए हैं।\n\n" +
      "💡 *सलाह: एआई आधारित 7, 15 और 30 दिवसीय पूर्वानुमान के लिए डैशबोर्ड पर **मूल्य भविष्यवाणी** देखें।*",

    net_realisation:
      "💰 **शुद्ध मुनाफा (Net Realisation) कैसे समझें?**\n\n" +
      "मंडी का कुल भाव ही किसान की असली कमाई नहीं होता! हमेशा अपना **शुद्ध मुनाफा** निकालें:\n\n" +
      "**शुद्ध मुनाफा सूत्र:**\n" +
      "`शुद्ध कमाई = कुल मंडी भाव - (परिवहन भाड़ा + लोडिंग/अनलोडिंग + मंडी शुल्क + तुलाई + नमी कटौती)`\n\n" +
      "• उदाहरण: मंडी A 60 किमी दूर ₹2,550 देती है (भाड़ा ₹85)।\n" +
      "• मंडी B 10 किमी दूर ₹2,510 देती है (भाड़ा ₹20)।\n" +
      "• **मंडी B में किसान को ₹25/क्विंटल अधिक शुद्ध नकद प्राप्त होता है!**\n\n" +
      "💡 *सटीक तुलना के लिए KrishiLink के **शुद्ध मुनाफा कैलकुलेटर** का उपयोग करें।*",

    sell_or_hold:
      "📈 **फसल बेचें या रोकें? (Sell vs Hold निर्णय)**\n\n" +
      "1. **रोकें (Hold):** यदि 45 दिनों में संभावित मूल्य वृद्धि वेयरहाउस किराए (₹0.25/क्विंटल/दिन) से अधिक हो।\n" +
      "2. **तुरंत बेचें (Sell):** यदि उपज में नमी अधिक (>14%) हो या मंडी भाव 90 दिनों के उच्चतम स्तर पर हों।\n" +
      "3. **KrishiLink सलाह:** गेहूं को प्रमाणित वेयरहाउस में 30–45 दिन रखने पर भंडारण खर्च काटकर ₹140–180/क्विंटल का अतिरिक्त लाभ संभव है।",

    fake_offers:
      "🛡️ **फर्जी एवं संदिग्ध ऑफर से सुरक्षा**\n\n" +
      "KrishiLink पर किसानों की सुरक्षा के मजबूत उपाय:\n\n" +
      "• **100% बैंक एस्क्रो सुरक्षा**: माल भेजने से पहले खरीदार को पूरी राशि बैंक एस्क्रो में जमा करनी होती है।\n" +
      "• **सत्यापित बैज**: हमेशा हरे **सत्यापित ✓** बैज और आधार/जीएसटीआईएन सत्यापित खरीदार से ही सौदा करें।\n" +
      "• **संदिग्ध मूल्य चेतावनी**: बाजार से 30% से अधिक अस्वाभाविक दर वाले बिना-एस्क्रो ऑफर्स को सिस्टम तुरंत फ्लैग करता है।\n" +
      "• जब तक ऐप में एस्क्रो जमा का पुष्टिकरण न मिले, माल किसी को न सौंपें।",

    sell_produce:
      "🛒 **KrishiLink पर अपनी फसल कैसे बेचें?**\n\n" +
      "5 सरल चरणों में सीधे सत्यापित खरीदारों को बेचें:\n\n" +
      "1. अपने किसान खाते में **लॉगिन** करें।\n" +
      "2. **मेरे लॉट्स** में जाकर **नया लॉट बनाएं** पर क्लिक करें।\n" +
      "3. फसल का नाम, मात्रा (क्विंटल/किलो), और अपेक्षित मूल्य भरें।\n" +
      "4. **कृषि विज्ञान केंद्र (KVK)** से गुणवत्ता जांच करवाकर 'Grade A' प्रमाणित बैज प्राप्त करें।\n" +
      "5. संस्थागत खरीदारों से सीधे ऑफर प्राप्त करें और 100% एस्क्रो सुरक्षा के साथ बेचें।",

    find_buyers:
      "🏪 **सत्यापित खरीदार कैसे खोजें?**\n\n" +
      "• मेनू में **खरीदार मांग (Demands)** पर जाएं और आटा मिलों, निर्यातकों व व्यापारियों की खुली मांग देखें।\n" +
      "• फसल, दूरी और न्यूनतम मूल्य के अनुसार फिल्टर करें।\n" +
      "• **खरीदार मैचिंग** का उपयोग करके अपनी फसल के लिए सबसे उपयुक्त खरीदार तुरंत चुनें।",

    buyer_match:
      "🤝 **स्मार्ट खरीदार मैचिंग प्रणाली**\n\n" +
      "KrishiLink का मैचिंग इंजन 4 मुख्य मानकों पर खरीदार से जोड़ता है:\n\n" +
      "• **गुणवत्ता संगतता (35%)**: लैब रिपोर्ट के अनुसार ग्रेड मैच।\n" +
      "• **दूरी व परिवहन (25%)**: कम भाड़े के लिए नजदीकी खरीदार को प्राथमिकता।\n" +
      "• **मूल्य मिलान (25%)**: किसान की मांग और खरीदार के बजट का सामंजस्य।\n" +
      "• **विश्वसनीयता स्कोर (15%)**: समय पर भुगतान करने वाले सत्यापित खरीदार।",

    my_produce:
      "🌾 **मेरे लॉट्स व उपज प्रबंधन**\n\n" +
      "• **मेरे लॉट्स** में जाकर अपनी सभी दर्ज फसलों की स्थिति देखें।\n" +
      "• डिजिटल किसान कार्ड और लैब परीक्षण प्रमाणपत्र देखें व प्रिंट करें।\n" +
      "• प्राप्त ऑफर्स देखें, स्वीकार करें या नया भाव प्रस्तावित करें।",

    logistics:
      "🚚 **परिवहन एवं वाहन बुकिंग**\n\n" +
      "• **लॉजिस्टिक्स** सेक्शन से जीपीएस-सक्षम वाहन सीधे बुक करें।\n" +
      "• 1-टन पिकअप, 5-टन मिनी ट्रक और 16-टन भारी वाहन विकल्प उपलब्ध।\n" +
      "• पारदर्शी प्रति किमी भाड़ा और डिलीवरी की लाइव ट्रैकिंग।",

    storage:
      "🏬 **वेयरहाउस एवं कोल्ड स्टोरेज भंडारण**\n\n" +
      "• नजदीकी प्रमाणित वेयरहाउस और कोल्ड स्टोरेज की सूची देखें।\n" +
      "• पारदर्शी दैनिक किराया दरें (लगभग ₹0.20 – ₹0.35/क्विंटल/दिन)।\n" +
      "• भंडारण के बाद **ई-एनडब्ल्यूआर (e-NWR)** रसीद प्राप्त करें और बैंक से कम ब्याज पर ऋण लें।",

    schemes:
      "📋 **प्रमुख सरकारी कृषि योजनाएं**\n\n" +
      "• **पीएम-किसान (PM-KISAN)**: प्रति वर्ष ₹6,000 (₹2,000 की 3 समान किस्तों में) सीधे बैंक खाते में।\n" +
      "• **पीएम फसल बीमा योजना (PMFBY)**: प्राकृतिक आपदा, सूखा या बेमौसम बारिश से नुकसान पर सुरक्षा।\n" +
      "• **किसान क्रेडिट कार्ड (KCC)**: 4% प्रभावी ब्याज दर पर ₹3 लाख तक का फसली ऋण।\n" +
      "• **ई-नाम (e-NAM)**: 1,360+ मंडियों का राष्ट्रीय इलेक्ट्रॉनिक व्यापार नेटवर्क।",
  },

  mr: {
    crop_prices:
      "📊 **बाजार भाव व तुलना**\n\n" +
      "• **गहू (लोकवन / शरबती)**: ₹२,४५० – ₹२,६८० / क्विंटल (इंदूर बाजार: +२.१% वाढ)\n" +
      "• **सोयाबीन (पिवळा)**: ₹४,७२० – ₹४,९८० / क्विंटल (देवास बाजार: स्थिर)\n" +
      "• **हरभरा / चणा**: ₹५,८०० – ₹६,१५० / क्विंटल (उज्जैन बाजार: +१.४% वाढ)\n" +
      "• **मोहरी**: ₹५,२०० – ₹५,४५० / क्विंटल (भोपाळ बाजार: स्थिर)\n\n" +
      "💡 *सल्ला: ५२०+ बाजार समित्यांमधील ताजे दर पाहण्यासाठी **बाजार भाव** पर्यायावर जा.*",

    market_trends:
      "📈 **बाजार कल व आवक अंदाज**\n\n" +
      "• **सोयाबीन**: तेल मिल आणि प्रक्रिया उद्योगांची मोठी मागणी असल्याने दर ₹४,८०० च्या वर राहण्याचा अंदाज आहे.\n" +
      "• **गहू**: खरेदी वाढल्यामुळे पुढील ३० दिवसांत +४.२% दर वाढीचा अंदाज आहे.\n" +
      "• **कडधान्ये**: बाजारात आवक मर्यादित असल्याने हरभरा आणि तुरीचे दर मजबूत राहतील.\n\n" +
      "💡 *सल्ला: पुढील ७, १५ आणि ३० दिवसांच्या अंदाजासाठी **मूल्य भविष्यवाणी** तपासा.*",

    net_realisation:
      "💰 **निव्वळ नफा (Net Realisation) कसा मोजावा?**\n\n" +
      "एकूण बाजार भाव म्हणजे प्रत्यक्ष शेतकऱ्याचा नफा नव्हे! नेहमी आपला **निव्वळ नफा** मोजा:\n\n" +
      "**निव्वळ नफा सूत्र:**\n" +
      "`निव्वळ प्राप्ती = एकूण बाजार दर - (वाहतूक भाडे + हमाली/तोलाई + सेस + आर्द्रता कपात)`\n\n" +
      "• उदाहरण: ६० किमी वरील बाजार समितीत दर ₹२,५५० (भाडे ₹८५).\n" +
      "• १० किमी वरील स्थानिक बाजारात दर ₹२,५१० (भाडे ₹२०).\n" +
      "• **स्थानिक बाजारात शेतकऱ्याला ₹२५/क्विंटल अधिक निव्वळ नफा मिळतो!**\n\n" +
      "💡 *KrishiLink च्या **निव्वळ नफा कॅल्क्युलेटर** चा वापर करा.*",

    sell_or_hold:
      "📈 **शेतमाल विका की ठेवा? (Sell vs Hold निर्णय)**\n\n" +
      "१. **साठवणूक करा (Hold):** जर पुढील ४५ दिवसांतील संभाव्य दर वाढ गोदामाच्या भाड्यापेक्षा (₹०.२५/क्विंटल/दिवस) जास्त असेल.\n" +
      "२. **त्वरित विका (Sell):** जर शेतमालामधील ओलावा जास्त (>१४%) असेल किंवा सध्याचे दर मागील ९० दिवसांतील सर्वोच्च पातळीवर असतील.\n" +
      "३. **KrishiLink सल्ला:** गव्हाचा साठा ३०–४५ दिवस अधिकृत गोदामात ठेवल्यास खर्च वजा जाता ₹१४०–१८०/क्विंटलचा अतिरिक्त नफा होऊ शकतो.",

    fake_offers:
      "🛡️ **बनावट व संशयास्पद खरेदीदारांपासून संरक्षण**\n\n" +
      "KrishiLink वरील सुरक्षिततेचे उपाय:\n\n" +
      "• **१००% बँक एस्क्रो सुरक्षा**: माल पाठवण्यापूर्वी खरेदीदाराला संपूर्ण रक्कम सुरक्षित बँक एस्क्रो खात्यात जमा करावी लागते.\n" +
      "• **प्रमाणित बॅज**: नेहमी हिरवा **प्रमाणित ✓** बॅज असलेल्या खरेदीदारांशीच व्यवहार करा.\n" +
      "• **संशयास्पद दरांची पूर्वसूचना**: बाजारापेक्षा ३०% पेक्षा जास्त अवास्तव दर देणाऱ्या संशयास्पद ऑफर्स सिस्टिम आपोआप ओळखते.\n" +
      "• ॲपमध्ये एस्क्रो जमा झाल्याची पुष्टी झाल्याशिवाय माल सोडू नका.",

    sell_produce:
      "🛒 **KrishiLink वर शेतमाल कसा विकावा?**\n\n" +
      "५ सोप्या टप्प्यांत थेट प्रमाणित खरेदीदारांना विक्री करा:\n\n" +
      "१. आपल्या शेतकरी खात्यात **लॉगिन** करा.\n" +
      "२. **माझा शेतमाल** वर जाऊन **नवीन लॉट नोंदवा** निवडा.\n" +
      "३. पीक, प्रमाण (किलो/क्विंटल) आणि अपेक्षित दर भरा.\n" +
      "४. **कृषी विज्ञान केंद्र (KVK)** कडून गुणवत्ता तपासणी करून 'Grade A' प्रमाणपत्र मिळवा.\n" +
      "५. खरेदीदारांकडून थेट ऑफर्स मिळवा आणि १००% एस्क्रो संरक्षणासह विक्री करा.",

    find_buyers:
      "🏪 **अधिकृत खरेदीदार कसे शोधावे?**\n\n" +
      "• मेनूमध्ये **खरेदीदार मागण्या (Demands)** तपासा आणि संस्थागत खरेदीदारांच्या मागण्या पहा.\n" +
      "• पीक, अंतर आणि दराप्रमाणे फिल्टर करा.\n" +
      "• **खरेदीदार जुळवणी** चा वापर करून आपल्या मालासाठी योग्य खरेदीदार त्वरित निवडा.",

    buyer_match:
      "🤝 **स्मार्ट खरेदीदार जुळवणी (Buyer Matching)**\n\n" +
      "KrishiLink चे मॅचिंग इंजिन ४ घटकांवर आधारित जुळवणी करते:\n\n" +
      "• **गुणवत्ता सुसंगतता (३५%)**: लॅब रिपोर्टनुसार योग्य प्रत.\n" +
      "• **अंतर आणि वाहतूक (२५%)**: कमी वाहतूक खर्चासाठी जवळचे खरेदीदार.\n" +
      "• **दर सुसंगतता (२५%)**: शेतकऱ्याचा अपेक्षित दर आणि खरेदीदाराचे बजेट.\n" +
      "• **विश्वासार्हता स्कोअर (१५%)**: वेळेवर पेमेंट करणारे अधिकृत खरेदीदार.",

    my_produce:
      "🌾 **माझा शेतमाल व्यवस्थापन**\n\n" +
      "• **माझा शेतमाल** मध्ये जाऊन सर्व नोंदणीकृत शेतमालाची स्थिती तपासा.\n" +
      "• डिजिटल किसान कार्ड आणि गुणवत्ता प्रमाणपत्र पहा व प्रिंट करा.\n" +
      "• प्राप्त ऑफर्स स्वीकारा किंवा नवीन दर सुचवा.",

    logistics:
      "🚚 **वाहतूक व वाहन व्यवस्था**\n\n" +
      "• **लॉजिस्टिक्स** विभागातून थेट जीपीएस-सुसज्ज वाहन बुक करा.\n" +
      "• १-टन पिकअप, ५-टन मिनी ट्रक आणि १६-टन अवजड वाहनांचे पर्याय उपलब्ध.\n" +
      "• पारदर्शक प्रति किमी दर आणि वाहतुकीचे थेट ट्रॅकिंग.",

    storage:
      "🏬 **गोदाम व शीतगृह साठवणूक**\n\n" +
      "• जवळच्या अधिकृत गोदाम आणि शीतगृहांची माहिती मिळवा.\n" +
      "• पारदर्शक दैनिक दर (सुमारे ₹०.२० – ₹०.३५/क्विंटल/दिवस).\n" +
      "• साठवणुकीनंतर **ई-एनडब्ल्यूआर (e-NWR)** पावती मिळवून बँकेकडून कमी व्याजावर कर्ज मिळवा.",

    schemes:
      "📋 **प्रमुख शासकीय कृषी योजना**\n\n" +
      "• **पीएम-किसान (PM-KISAN)**: दरवर्षी ₹६,००० (₹२,००० चे ३ समान हप्ते) थेट बँक खात्यात.\n" +
      "• **पीएम पीक विमा योजना (PMFBY)**: दुष्काळ, अतिवृष्टी किंवा अवकाळी पावसाने झालेल्या नुकसानावर विमा संरक्षण.\n" +
      "• **किसान क्रेडिट कार्ड (KCC)**: ४% सवलतीच्या व्याजदराने ₹३ लाखांपर्यंत पीक कर्ज.\n" +
      "• **ई-नाम (e-NAM)**: १,३६०+ बाजार समित्यांचे राष्ट्रीय इलेक्ट्रॉनिक व्यापार नेटवर्क.",
  },
};

// ============================================================================
// 2. QUICK ACTION MATCHING HELPER
// ============================================================================
export function matchQuickActionKey(message) {
  if (!message) return null;
  const q = message.toLowerCase().trim();

  if (
    q.includes("sell or hold") ||
    q.includes("बेचें या रोकें") ||
    q.includes("विका की ठेवा") ||
    q.includes("sell vs hold") ||
    q.includes("hold or sell")
  ) {
    return "sell_or_hold";
  }

  if (
    q.includes("mandi price") ||
    q.includes("crop rates") ||
    q.includes("crop price") ||
    q.includes("मंडी भाव") ||
    q.includes("बाजार भाव") ||
    q.includes("गव्हाचा भाव") ||
    q.includes("wheat price") ||
    q.includes("soybean price") ||
    q.includes("भाव बताएं") ||
    q.includes("latest crop and mandi prices")
  ) {
    return "crop_prices";
  }

  if (
    q.includes("net realis") ||
    q.includes("net realiz") ||
    q.includes("शुद्ध मुनाफा") ||
    q.includes("निव्वळ प्राप्ती") ||
    q.includes("निव्वळ नफा") ||
    q.includes("किसान का मुनाफा")
  ) {
    return "net_realisation";
  }

  if (
    q.includes("fake offer") ||
    q.includes("फेक ऑफर") ||
    q.includes("संशयास्पद खरेदी") ||
    q.includes("फर्जी") ||
    q.includes("fraud") ||
    q.includes("scam") ||
    q.includes("बनावट")
  ) {
    return "fake_offers";
  }

  if (
    q.includes("sell produce") ||
    q.includes("list and sell") ||
    q.includes("फसल कैसे बेचें") ||
    q.includes("शेतमाल कसा विकावा") ||
    q.includes("फसल लिस्ट") ||
    q.includes("माल कसा विकायचा") ||
    q.includes("list my produce") ||
    q.includes("list produce")
  ) {
    return "sell_produce";
  }

  if (
    q.includes("find buyer") ||
    q.includes("find suitable buyer") ||
    q.includes("खरीदार खोजें") ||
    q.includes("खरेदीदार शोधा") ||
    q.includes("व्यापारी और खरीदार") ||
    q.includes("खरेदीदार शोधणे")
  ) {
    return "find_buyers";
  }

  if (
    q.includes("fpo matching") ||
    q.includes("buyer match") ||
    q.includes("match farmers with buyers") ||
    q.includes("fpo मैचिंग") ||
    q.includes("fpo जुळवणी") ||
    q.includes("सामूहिक बिक्री")
  ) {
    return "buyer_match";
  }

  if (
    q.includes("storage") ||
    q.includes("warehouse") ||
    q.includes("वेयरहाउस") ||
    q.includes("गोदाम") ||
    q.includes("शीतगृह") ||
    q.includes("cold storage") ||
    q.includes("भंडारण")
  ) {
    return "storage";
  }

  if (
    q.includes("logistics") ||
    q.includes("परिवहन") ||
    q.includes("वाहतूक") ||
    q.includes("भाड़ा") ||
    q.includes("transportation and logistics") ||
    q.includes("transport") ||
    q.includes("truck") ||
    q.includes("गाड़ी")
  ) {
    return "logistics";
  }

  if (
    q.includes("manage my produce") ||
    q.includes("manage my listed produce") ||
    q.includes("मेरे लॉट्स") ||
    q.includes("माझा शेतमाल") ||
    q.includes("my produce")
  ) {
    return "my_produce";
  }

  if (
    q.includes("govt scheme") ||
    q.includes("government scheme") ||
    q.includes("सरकारी योजना") ||
    q.includes("शासकीय योजना") ||
    q.includes("pm-kisan") ||
    q.includes("pmfby") ||
    q.includes("फसल बीमा")
  ) {
    return "schemes";
  }

  if (
    q.includes("market trend") ||
    q.includes("बाजार रुझान") ||
    q.includes("बाजार कल") ||
    q.includes("price trend")
  ) {
    return "market_trends";
  }

  return null;
}

// ============================================================================
// 3. DOMAIN-AWARE FALLBACK RESPONDER
// Provides natural, accurate domain answers in user's language if Gemini is offline
// ============================================================================
export function getDomainFallback(message, langKey = "en", history = []) {
  const q = (message || "").toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|namaste|pranam|namaskar|नमस्ते|नमस्कार|प्रणाम)/i.test(q)) {
    if (langKey === "mr") {
      return (
        "नमस्कार! 👋 मी आपला KrishiLink सहाय्यक आहे. मी आपल्याला खालील बाबींमध्ये मदत करू शकतो:\n\n" +
        "• ताजे बाजार भाव आणि दर कल तपासणे\n" +
        "• आपला शेतमाल विक्रीसाठी नोंदवणे\n" +
        "• अधिकृत खरेदीदार शोधणे व जुळवणी\n" +
        "• कृषी विज्ञान केंद्र गुणवत्ता तपासणी\n" +
        "• वाहतूक व गोदाम साठवणूक व्यवस्था\n" +
        "• शासकीय कृषी योजनांची माहिती\n\n" +
        "सांगा, आज मी आपल्याला कशी मदत करू?"
      );
    }
    if (langKey === "hi") {
      return (
        "नमस्ते! 👋 मैं आपका KrishiLink सहायक हूँ। मैं आपकी निम्न विषयों में सहायता कर सकता हूँ:\n\n" +
        "• ताज़ा मंडी भाव और मूल्य रुझान देखना\n" +
        "• अपनी फसल को बिक्री हेतु लिस्ट करना\n" +
        "• सत्यापित खरीदार खोजना और मैचिंग\n" +
        "• कृषि विज्ञान केंद्र गुणवत्ता जांच\n" +
        "• परिवहन व वेयरहाउस भंडारण व्यवस्था\n" +
        "• सरकारी कृषि योजनाओं की जानकारी\n\n" +
        "बताइए, आज मैं आपकी क्या सहायता करूँ?"
      );
    }
    return (
      "Hello! 👋 I am your KrishiLink Assistant. I can help you with:\n\n" +
      "• Checking live mandi prices and price trends\n" +
      "• Listing your crop lots for sale\n" +
      "• Finding verified buyers and automated matching\n" +
      "• Quality grading and Krishi Kendra inspection\n" +
      "• Arranging logistics and warehouse storage\n" +
      "• Information on agricultural government schemes\n\n" +
      "How can I assist you today?"
    );
  }

  // Check quick action match first
  const matchedKey = matchQuickActionKey(q);
  if (matchedKey) {
    const dict = predefinedResponses[langKey] || predefinedResponses.en;
    if (dict[matchedKey]) return dict[matchedKey];
  }

  // MSP questions
  if (q.includes("msp") || q.includes("न्यूनतम समर्थन मूल्य") || q.includes("हमीभाव")) {
    if (langKey === "mr") {
      return (
        "🌾 **हमीभाव (MSP - Minimum Support Price)**\n\n" +
        "शासनाने कृषी पिकांसाठी ठरवलेला किमान हमीभाव:\n" +
        "• **गहू**: ₹२,२७५ / क्विंटल\n" +
        "• **सोयाबीन**: ₹४,८९२ / क्विंटल\n" +
        "• **हरभरा**: ₹५,४४० / क्विंटल\n" +
        "• **मोहरी**: ₹५,६५० / क्विंटल\n\n" +
        "KrishiLink वर शेतकरी थेट खुल्या बाजारात आणि हमीभावापेक्षा जास्त दराने खरेदीदारांना माल विकू शकतात."
      );
    }
    if (langKey === "hi") {
      return (
        "🌾 **न्यूनतम समर्थन मूल्य (MSP - Minimum Support Price)**\n\n" +
        "केंद्र सरकार द्वारा निर्धारित प्रमुख फसलों का एमएसपी:\n" +
        "• **गेहूं**: ₹2,275 / क्विंटल\n" +
        "• **सोयाबीन**: ₹4,892 / क्विंटल\n" +
        "• **चना**: ₹5,440 / क्विंटल\n" +
        "• **सरसों**: ₹5,650 / क्विंटल\n\n" +
        "KrishiLink पर आप अपनी स्थानीय मंडी के भावों की तुलना सीधे एमएसपी से कर सकते हैं।"
      );
    }
    return (
      "🌾 **Minimum Support Price (MSP)**\n\n" +
      "Current government benchmark MSP rates:\n" +
      "• **Wheat**: ₹2,275 / quintal\n" +
      "• **Soybean**: ₹4,892 / quintal\n" +
      "• **Gram (Chana)**: ₹5,440 / quintal\n" +
      "• **Mustard**: ₹5,650 / quintal\n\n" +
      "On KrishiLink, you can compare local mandi spot rates against the MSP to decide whether to sell in mandis or to institutional buyers."
    );
  }

  // KYC questions
  if (q.includes("kyc") || q.includes("केवाईसी") || q.includes("केवायसी") || q.includes("आधार") || q.includes("aadhaar")) {
    if (langKey === "mr") {
      return (
        "🛡️ **KrishiLink केवायसी पडताळणी**\n\n" +
        "• आपल्या प्रोफाइलवर जा आणि **Verify KYC Now** बटणावर क्लिक करा.\n" +
        "• १२-अंकी आधार क्रमांक प्रविष्ट करा.\n" +
        "• नोंदणीकृत मोबाईलवर प्राप्त डेमो OTP (उदा. १२३४५६) भरा.\n" +
        "• पडताळणी पूर्ण झाल्यावर आपल्या प्रोफाइलवर हिरवा **Verified ✓** बॅज सक्रिय होईल."
      );
    }
    if (langKey === "hi") {
      return (
        "🛡️ **KrishiLink केवाईसी सत्यापन प्रक्रिया**\n\n" +
        "• अपनी प्रोफाइल पर जाएं और **Verify KYC Now** बटन पर क्लिक करें।\n" +
        "• अपना 12 अंकों का आधार नंबर दर्ज करें।\n" +
        "• पंजीकृत मोबाइल पर प्राप्त डेमो ओटीपी (उदा. 123456) दर्ज करें।\n" +
        "• सत्यापन सफल होने पर आपकी प्रोफाइल पर हरा **Verified ✓** बैज सक्रिय हो जाएगा।"
      );
    }
    return (
      "🛡️ **KrishiLink KYC Verification**\n\n" +
      "• Go to your Profile and click **Verify KYC Now**.\n" +
      "• Enter your 12-digit Aadhaar number.\n" +
      "• Enter the demo OTP (e.g. 123456) received on your phone.\n" +
      "• Once verified, the green **Verified ✓** trust badge will be activated on your profile."
    );
  }

  // Contextual follow-up handling
  if (Array.isArray(history) && history.length > 0) {
    const lastUserTurn = history.filter((h) => h.role === "user" || h.role === "assistant").pop();
    const lastText = (lastUserTurn?.text || lastUserTurn?.content || "").toLowerCase();

    if (q.includes("should i sell") || q.includes("कब बेचूं") || q.includes("कधी विकू")) {
      const dict = predefinedResponses[langKey] || predefinedResponses.en;
      return dict.sell_or_hold;
    }

    if (lastText.includes("wheat") || lastText.includes("गेहूं") || lastText.includes("गहू")) {
      if (langKey === "mr") {
        return "गव्हाच्या बाबतीत, सध्या इंदूर बाजारात ₹२,४५० ते ₹२,६८० दर आहेत. पुढील ३० दिवसांत दर वाढण्याचा अंदाज असल्याने गोदामात साठवणूक करणे फायदेशीर ठरू शकते.";
      }
      if (langKey === "hi") {
        return "गेहूं के संबंध में, वर्तमान में इंदौर मंडी में ₹2,450 से ₹2,680 के भाव हैं। आगामी 30 दिनों में मांग मजबूत रहने का अनुमान है, इसलिए वेयरहाउस में रोकना लाभकारी हो सकता है।";
      }
      return "Regarding wheat, current mandi prices range between ₹2,450 – ₹2,680/qtl. With steady demand from flour millers, holding for 30–45 days in certified storage is projected to yield better returns.";
    }
  }

  // General helpful default
  if (langKey === "mr") {
    return (
      "धन्यवाद! KrishiLink वर आपण ताज्या बाजार भावांची माहिती, थेट खरेदीदार जुळवणी, शुद्ध नफा मोजणी, आणि शेतमाल विक्रीची पूर्ण मदत मिळवू शकता.\n\n" +
      "कृपया आपले पीक सांगा किंवा प्रश्न विचारा (उदा. 'गव्हाचा भाव', 'शेतमाल कसा विकावा', 'हमीभाव किती आहे')."
    );
  }
  if (langKey === "hi") {
    return (
      "धन्यवाद! KrishiLink पर आप लाइव मंडी भाव, खरीदार मैचिंग, शुद्ध मुनाफा (Net Realisation) और फसल बिक्री की पूरी सहायता प्राप्त कर सकते हैं।\n\n" +
      "कृपया फसल का नाम बताएं या अपना प्रश्न लिखें (उदा. 'सोयाबीन का भाव', 'फसल कैसे बेचें', 'फेक ऑफर से बचाव')।"
    );
  }
  return (
    "Thank you for contacting KrishiLink Assistant. We connect farmers, FPOs, and buyers with transparent mandi rates, direct trading, verified quality inspections, and reliable logistics.\n\n" +
    "Feel free to ask about crop prices, how to list your harvest, buyer matching, or government schemes!"
  );
}

// ============================================================================
// 4. MAIN CHAT RESPONSE GENERATOR (DUAL ARCHITECTURE)
// Supports BOTH:
// 1. Existing predefined/quick-service responses
// 2. Natural AI conversation using Google Gemini + multi-turn history + fallback
// ============================================================================
export async function generateChatResponse(input, options = {}) {
  // Normalize parameters: accepts either string OR object { message, history, language, isQuickAction }
  let message = "";
  let history = [];
  let language = "en";
  let isQuickAction = false;

  if (typeof input === "object" && input !== null) {
    message = input.message || "";
    history = Array.isArray(input.history) ? input.history : [];
    language = input.language || "en";
    isQuickAction = Boolean(input.isQuickAction);
  } else {
    message = input || "";
    history = Array.isArray(options.history) ? options.history : [];
    language = options.language || "en";
    isQuickAction = Boolean(options.isQuickAction);
  }

  const cleanMsg = String(message || "").trim();
  const langKey = ["en", "hi", "mr"].includes(language) ? language : "en";
  const dict = predefinedResponses[langKey] || predefinedResponses.en;

  if (!cleanMsg) {
    if (langKey === "mr") return "कृपया आपल्याला काय मदत हवी आहे ते सांगा.";
    if (langKey === "hi") return "कृपया बताएं कि आपको किस विषय में सहायता चाहिए।";
    return "Please tell me what you need help with.";
  }

  // --------------------------------------------------------------------------
  // STEP 1: QUICK ACTION / PREDEFINED SERVICE CHECK
  // If flagged as quick action or matches a known quick action prompt:
  // Return the existing predefined response immediately.
  // --------------------------------------------------------------------------
  const quickKey = matchQuickActionKey(cleanMsg);
  if ((isQuickAction && quickKey && dict[quickKey]) || (quickKey && dict[quickKey])) {
    return dict[quickKey];
  }

  // --------------------------------------------------------------------------
  // STEP 2: NATURAL AI CONVERSATION (Google Gemini with Language & History)
  // --------------------------------------------------------------------------
  const langNames = {
    en: "English",
    hi: "Hindi (हिंदी)",
    mr: "Marathi (मराठी)",
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
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.5-pro",
    ];

    // Build multi-turn conversation history
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        const text = item.text || item.content;
        if (!text) continue;
        if (item.role === "user") {
          contents.push({ role: "user", parts: [{ text }] });
        } else if (item.role === "bot" || item.role === "assistant" || item.role === "model") {
          contents.push({ role: "model", parts: [{ text }] });
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
        console.warn(`Model ${model} unavailable (${err?.status || err?.message || "error"}), trying next model...`);
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP 3: ROBUST DOMAIN FALLBACK (If AI API is unreachable)
  // Provides natural, accurate answers instead of a blank screen or 500 error
  // --------------------------------------------------------------------------
  return getDomainFallback(cleanMsg, langKey, history);
}

export default {
  generateChatResponse,
  predefinedResponses,
  matchQuickActionKey,
  getDomainFallback,
};