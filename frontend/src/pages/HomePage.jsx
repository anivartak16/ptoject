import React, { useState } from "react";
import "../landing.css";
import { LandingNavbar } from "../components/landing/LandingNavbar.jsx";
import { HeroSection } from "../components/landing/HeroSection.jsx";
import { TrustValueSection } from "../components/landing/TrustValueSection.jsx";
import { LivePriceTape } from "../components/landing/LivePriceTape.jsx";
import { DigitalTradingFloor } from "../components/landing/DigitalTradingFloor.jsx";
import { CropPriceTable } from "../components/landing/CropPriceTable.jsx";
import { BestMandiSection } from "../components/landing/BestMandiSection.jsx";
import { LiveBidsSection } from "../components/landing/LiveBidsSection.jsx";
import { HowItWorksSection } from "../components/landing/HowItWorksSection.jsx";
import { UspSection } from "../components/landing/UspSection.jsx";
import { RolesSection } from "../components/landing/RolesSection.jsx";
import { LandingCtaSection } from "../components/landing/LandingCtaSection.jsx";

export function HomePage() {
  const [language, setLanguage] = useState("en");
  const [selectedCrop, setSelectedCrop] = useState("Wheat");

  const marketRows = [
    ["Indore Mandi", "₹2,450", "+1.8%", "130 qtl"],
    ["Neemuch Mandi", "₹2,540", "+2.4%", "250 qtl"],
    ["Mandsaur Mandi", "₹2,522", "+1.9%", "226 qtl"],
    ["Bhopal Mandi", "₹2,504", "+1.5%", "202 qtl"],
  ];

  const crops = [
    {
      name: "Wheat",
      emoji: "🌾",
      price: 2450,
      change: "+4.1%",
      trend: "up",
      demand: "High",
    },
    {
      name: "Rice",
      emoji: "🌾",
      price: 3800,
      change: "+5.6%",
      trend: "up",
      demand: "High",
    },
    {
      name: "Onion",
      emoji: "🧅",
      price: 1850,
      change: "-5.1%",
      trend: "down",
      demand: "Medium",
    },
    {
      name: "Tomato",
      emoji: "🍅",
      price: 45,
      change: "+18.4%",
      trend: "up",
      demand: "High",
    },
    {
      name: "Chilli",
      emoji: "🌶️",
      price: 8200,
      change: "+5.1%",
      trend: "up",
      demand: "High",
    },
    {
      name: "Potato",
      emoji: "🥔",
      price: 28,
      change: "-6.7%",
      trend: "down",
      demand: "Low",
    },
  ];

  const selectedCropData =
    crops.find((crop) => crop.name === selectedCrop) || crops[0];

  return (
    <div className="landing">
      
      <LandingNavbar language={language} setLanguage={setLanguage} />
      <main className="landing-main">
        <HeroSection language={language} />
        <TrustValueSection language={language} />
        <LivePriceTape language={language} marketRows={marketRows} />
        <DigitalTradingFloor language={language} />
        <CropPriceTable
          language={language}
          crops={crops}
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          selectedCropData={selectedCropData}
        />
        <BestMandiSection language={language} marketRows={marketRows} />
        <LiveBidsSection language={language} />
        <HowItWorksSection language={language} />
        <UspSection language={language} />
        <RolesSection language={language} />
        <LandingCtaSection language={language} />
      </main>
    </div>
  );
}

export default HomePage;
