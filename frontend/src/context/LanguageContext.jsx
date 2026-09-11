import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  // Brand & General Navigation
  appName: {
    en: "KrishiLink",
    hi: "कृषिलिंक",
    mr: "कृषिलिंक",
  },
  tagline: {
    en: "National Digital Mandi Network",
    hi: "राष्ट्रीय डिजिटल मंडी नेटवर्क",
    mr: "राष्ट्रीय डिजिटल कृषी बाजार नेटवर्क",
  },
  panIndia: {
    en: "PAN-INDIA",
    hi: "अखिल भारतीय",
    mr: "अखिल भारतीय",
  },
  mandiRates: {
    en: "Mandi Rates",
    hi: "मंडी भाव",
    mr: "बाजार भाव",
  },
  howItWorks: {
    en: "How It Works",
    hi: "कार्यप्रणाली",
    mr: "कार्यपद्धती",
  },
  buyerDemands: {
    en: "Buyer Demands",
    hi: "खरीदार मांग",
    mr: "खरेदीदार मागणी",
  },
  mandiNetwork: {
    en: "Mandi Network",
    hi: "मंडी नेटवर्क",
    mr: "बाजार समिती नेटवर्क",
  },
  stakeholders: {
    en: "Stakeholders",
    hi: "भागीदार",
    mr: "भागीदार घटक",
  },
  admin: {
    en: "Admin",
    hi: "एडमिन",
    mr: "प्रशासक",
  },
  myDashboard: {
    en: "My Dashboard",
    hi: "मेरा डैशबोर्ड",
    mr: "माझे डॅशबोर्ड",
  },
  signIn: {
    en: "Sign In",
    hi: "लॉगिन",
    mr: "लॉगिन करा",
  },
  signOut: {
    en: "Sign Out",
    hi: "लॉगआउट",
    mr: "लॉगआउट करा",
  },
  getStarted: {
    en: "Get Started",
    hi: "शुरू करें",
    mr: "सुरुवात करा",
  },
  sellProduce: {
    en: "Sell Produce (Farmer / FPO)",
    hi: "फसल बेचें (किसान / FPO)",
    mr: "शेतमाल विका (शेतकरी / FPO)",
  },
  viewDemands: {
    en: "View Live Buyer Demands",
    hi: "खरीदार मांग देखें",
    mr: "खरेदीदार मागणी पहा",
  },

  // Sidebar & Modules
  dashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    mr: "डॅशबोर्ड",
  },
  myProfile: {
    en: "My Profile",
    hi: "मेरी प्रोफाइल",
    mr: "माझी प्रोफाईल",
  },
  myFarm: {
    en: "My Farm",
    hi: "मेरा खेत",
    mr: "माझी शेती",
  },
  myLots: {
    en: "My Lots",
    hi: "मेरे लॉट्स",
    mr: "माझे शेतमाल लॉट्स",
  },
  browseLots: {
    en: "Browse Lots",
    hi: "लॉट्स देखें",
    mr: "शेतमाल लॉट्स शोधा",
  },
  marketPrices: {
    en: "Market Prices",
    hi: "मंडी भाव",
    mr: "बाजार भाव",
  },
  marketPrediction: {
    en: "Market Prediction",
    hi: "बाजार पूर्वानुमान",
    mr: "बाजार अंदाज",
  },
  offers: {
    en: "Offers",
    hi: "ऑफर व बोलियां",
    mr: "खरेदी ऑफर",
  },
  transactions: {
    en: "Transactions",
    hi: "सौदे व लेनदेन",
    mr: "व्यवहार व सौदे",
  },
  payments: {
    en: "Payments",
    hi: "भुगतान व एस्क्रो",
    mr: "पेमेंट व एस्क्रो",
  },
  logistics: {
    en: "Logistics",
    hi: "परिवहन / वाहन",
    mr: "वाहतूक व्यवस्था",
  },
  storage: {
    en: "Storage",
    hi: "भंडारण / गोदाम",
    mr: "गोदाम साठवणूक",
  },
  notifications: {
    en: "Notifications",
    hi: "सूचनाएं",
    mr: "सूचना",
  },
  disputes: {
    en: "Disputes",
    hi: "शिकायत व विवाद",
    mr: "तक्रार व निवारण",
  },
  inspectionDesk: {
    en: "Inspection Desk",
    hi: "निरीक्षण डेस्क",
    mr: "गुणवत्ता तपासणी कक्ष",
  },
  dailyPriceSync: {
    en: "Daily Price Sync",
    hi: "दैनिक भाव सिंक",
    mr: "दैनंदिन दर अपडेट",
  },
  users: {
    en: "Users",
    hi: "उपयोगकर्ता",
    mr: "वापरकर्ते",
  },
  analytics: {
    en: "Analytics",
    hi: "एनालिटिक्स",
    mr: "विश्लेषण",
  },
  farmers: {
    en: "Farmers",
    hi: "किसान",
    mr: "शेतकरी",
  },
  aggregatedLots: {
    en: "Aggregated Lots",
    hi: "एकत्रित लॉट्स",
    mr: "एकत्रित शेतमाल",
  },
  aggregation: {
    en: "Aggregation",
    hi: "एकत्रीकरण",
    mr: "एकत्रीकरण",
  },
  matching: {
    en: "Matching",
    hi: "मैचिंग",
    mr: "खरेदीदार जुळवणी",
  },
  recommendations: {
    en: "Recommended Lots",
    hi: "अनुशंसित लॉट्स",
    mr: "शिफारस केलेले लॉट्स",
  },

  // Roles
  roleFarmer: {
    en: "Farmer",
    hi: "किसान",
    mr: "शेतकरी",
  },
  roleBuyer: {
    en: "Buyer",
    hi: "खरीदार",
    mr: "खरेदीदार",
  },
  roleFpo: {
    en: "FPO",
    hi: "एफपीओ (FPO)",
    mr: "शेतकरी उत्पादक कंपनी (FPO)",
  },
  roleKvk: {
    en: "Krishi Kendra",
    hi: "कृषि विज्ञान केंद्र",
    mr: "कृषी विज्ञान केंद्र",
  },
  roleAdmin: {
    en: "Admin",
    hi: "प्रशासक",
    mr: "प्रशासक",
  },

  // Lot Entry & Quality
  addLot: {
    en: "Register New Crop Lot",
    hi: "नया फसल लॉट दर्ज करें",
    mr: "नवीन शेतमाल नोंदवा",
  },
  cropCommodity: {
    en: "Crop Commodity",
    hi: "फसल / जींस",
    mr: "शेतमाल पीक",
  },
  variety: {
    en: "Variety",
    hi: "किस्म / वैरायटी",
    mr: "वाण / जात",
  },
  quantityKg: {
    en: "Quantity (kg)",
    hi: "मात्रा (किलोग्राम)",
    mr: "वजन / प्रमाण (किलो)",
  },
  expectedPrice: {
    en: "Expected Price (₹/kg)",
    hi: "अपेक्षित मूल्य (₹/किग्रा)",
    mr: "अपेक्षित दर (₹/किलो)",
  },
  harvestDate: {
    en: "Harvest Date",
    hi: "कटाई की तिथि",
    mr: "कापणीची तारीख",
  },
  storageLocation: {
    en: "Storage / Farm Location",
    hi: "भंडारण / खेत का स्थान",
    mr: "साठवणूक / शेताचे ठिकाण",
  },
  submitForVerification: {
    en: "Submit for KVK Testing & Certification",
    hi: "कृषि केंद्र गुणवत्ता जांच हेतु भेजें",
    mr: "कृषी केंद्राकडे तपासणीसाठी पाठवा",
  },
  publishToMarketplace: {
    en: "🚀 List on Marketplace for Selling",
    hi: "🚀 बाजार में बिक्री हेतु लाइव करें",
    mr: "🚀 विक्रीसाठी बाजारात उपलब्ध करा",
  },
  resubmitTesting: {
    en: "🔄 Resubmit for Quality Testing",
    hi: "🔄 पुनः गुणवत्ता परीक्षण हेतु भेजें",
    mr: "🔄 पुन्हा तपासणीसाठी पाठवा",
  },

  // Status Badges
  statusPendingVerification: {
    en: "Pending KVK Testing",
    hi: "कृषि केंद्र जांच लंबित",
    mr: "तपासणी प्रलंबित",
  },
  statusVerified: {
    en: "KVK Certified",
    hi: "गुणवत्ता प्रमाणित",
    mr: "गुणवत्ता प्रमाणित",
  },
  statusAvailable: {
    en: "Live on Market",
    hi: "बाजार में उपलब्ध",
    mr: "विक्रीसाठी उपलब्ध",
  },
  statusPartiallySold: {
    en: "Partially Sold",
    hi: "आंशिक बिका हुआ",
    mr: "काही प्रमाणात विकले",
  },
  statusSold: {
    en: "Sold Out",
    hi: "पूर्ण बिका हुआ",
    mr: "पूर्ण विकले गेले",
  },
  statusRejected: {
    en: "Quality Rejected",
    hi: "अस्वीकृत",
    mr: "अपात्र ठरवले",
  },

  // Payment & Transactions
  payNow: {
    en: "Proceed to Payment",
    hi: "भुगतान करें",
    mr: "पेमेंट करा",
  },
  securePayment: {
    en: "Secure Agri-Escrow Payment",
    hi: "सुरक्षित कृषि एस्क्रो भुगतान",
    mr: "सुरक्षित कृषी एस्क्रो पेमेंट",
  },
  orderSummary: {
    en: "Order Summary",
    hi: "ऑर्डर सारांश",
    mr: "ऑर्डर तपशील",
  },
  produceTotal: {
    en: "Crop Produce Subtotal",
    hi: "फसल उप-योग",
    mr: "शेतमाल एकूण रक्कम",
  },
  escrowFee: {
    en: "Escrow Assurance Fee (1%)",
    hi: "एस्क्रो सुरक्षा शुल्क (1%)",
    mr: "एस्क्रो सुरक्षा शुल्क (१%)",
  },
  gst: {
    en: "Applicable Taxes / GST",
    hi: "लागू कर / जीएसटी",
    mr: "लागू कर / जीएसटी",
  },
  grandTotal: {
    en: "Total Payable",
    hi: "कुल देय राशि",
    mr: "एकूण देय रक्कम",
  },
  paymentMethod: {
    en: "Select Payment Method",
    hi: "भुगतान विधि चुनें",
    mr: "पेमेंट पर्याय निवडा",
  },
  upiInstant: {
    en: "UPI Instant (PhonePe, GPay, Paytm)",
    hi: "यूपीआई (PhonePe, GPay, Paytm)",
    mr: "यूपीआय (PhonePe, GPay, Paytm)",
  },
  netBanking: {
    en: "Escrow Net Banking (SBI, HDFC, ICICI)",
    hi: "नेट बैंकिंग एस्क्रो (SBI, HDFC, ICICI)",
    mr: "नेट बँकिंग एस्क्रो (SBI, HDFC, ICICI)",
  },
  rupayCard: {
    en: "Kisan Credit / Debit Card",
    hi: "किसान क्रेडिट / डेबिट कार्ड",
    mr: "किसान क्रेडिट / डेबिट कार्ड",
  },
  mandiPay: {
    en: "Mandi Direct Settlement / RTGS",
    hi: "मंडी डायरेक्ट / आरटीजीएस",
    mr: "मंडी थेट व्यवहार / आरटीजीएस",
  },
  payButton: {
    en: "Lock in Escrow & Confirm Deal",
    hi: "एस्क्रो में लॉक करें और सौदा पक्का करें",
    mr: "एस्क्रो सुरक्षित करून सौदा निश्चित करा",
  },
  paymentSuccess: {
    en: "Payment Successful & Escrow Secured!",
    hi: "भुगतान सफल व एस्क्रो सुरक्षित!",
    mr: "पेमेंट यशस्वी व रक्कम सुरक्षित!",
  },
  paymentProcessing: {
    en: "Processing Escrow Settlement…",
    hi: "एस्क्रो भुगतान संसाधित हो रहा है…",
    mr: "पेमेंट प्रक्रिया सुरू आहे…",
  },
  transactionId: {
    en: "Transaction ID",
    hi: "लेनदेन संख्या (Txn ID)",
    mr: "व्यवहार क्रमांक (Txn ID)",
  },
  viewInTransactions: {
    en: "View in Transactions",
    hi: "लेनदेन सूची देखें",
    mr: "व्यवहार यादीत पहा",
  },
  downloadReceipt: {
    en: "Download Digital Receipt",
    hi: "डिजिटल रसीद डाउनलोड करें",
    mr: "डिजिटल पावती डाउनलोड करा",
  },

  // Transaction Lifecycle
  txnCreated: {
    en: "Agreement Created",
    hi: "सौदा दर्ज",
    mr: "सौदा नोंदवला",
  },
  txnConfirmed: {
    en: "Payment Secured (Escrow Locked)",
    hi: "भुगतान सुरक्षित (एस्क्रो में जमा)",
    mr: "पेमेंट सुरक्षित (एस्क्रो जमा)",
  },
  txnInTransit: {
    en: "Produce In Transit",
    hi: "माल परिवहन में है",
    mr: "माल वाहतुकीत आहे",
  },
  txnDelivered: {
    en: "Delivered to Buyer",
    hi: "खरीदार को प्राप्त",
    mr: "खरेदीदारास पोहोचला",
  },
  txnCompleted: {
    en: "Deal Completed & Escrow Released",
    hi: "सौदा पूर्ण व भुगतान विमुक्त",
    mr: "सौदा पूर्ण व रक्कम वितरित",
  },
  txnCancelled: {
    en: "Cancelled",
    hi: "रद्द किया गया",
    mr: "रद्द झाले",
  },
  txnDisputed: {
    en: "Dispute Under Review",
    hi: "विवाद समीक्षाधीन",
    mr: "तक्रार चौकशी सुरू",
  },

  // Buttons & Actions
  search: {
    en: "Search…",
    hi: "खोजें…",
    mr: "शोधा…",
  },
  filter: {
    en: "Filter",
    hi: "फ़िल्टर",
    mr: "फिल्टर",
  },
  all: {
    en: "All",
    hi: "सभी",
    mr: "सर्व",
  },
  confirm: {
    en: "Confirm",
    hi: "पुष्टि करें",
    mr: "निश्चित करा",
  },
  cancel: {
    en: "Cancel",
    hi: "रद्द करें",
    mr: "रद्द करा",
  },
  back: {
    en: "Back",
    hi: "वापस",
    mr: "मागे",
  },
  close: {
    en: "Close",
    hi: "बंद करें",
    mr: "बंद करा",
  },
  retry: {
    en: "Try Again",
    hi: "पुनः प्रयास करें",
    mr: "पुन्हा प्रयत्न करा",
  },
  loading: {
    en: "Loading…",
    hi: "लोड हो रहा है…",
    mr: "लोड होत आहे…",
  },
  noRecords: {
    en: "No records found.",
    hi: "कोई रिकॉर्ड नहीं मिला।",
    mr: "माहिती उपलब्ध नाही.",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("krishilink_lang") || "en";
  });

  const setLanguage = (lang) => {
    if (["en", "hi", "mr"].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem("krishilink_lang", lang);
    }
  };

  const t = (key, fallback = "") => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    if (translations[key] && translations[key]["en"]) {
      return translations[key]["en"];
    }
    return fallback || key;
  };

  const getLabel = (en, hi, mr) => {
    if (language === "mr") return mr || hi || en;
    if (language === "hi") return hi || en;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
