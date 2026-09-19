/**
 * Structured, farmer-friendly, scientifically backed organic farming guidance.
 * Aligns with ICAR, NCOF (National Centre of Organic Farming), and PKVY standards.
 */

export const ORGANIC_CROP_GUIDES = {
  Wheat: {
    crop: "Wheat",
    label: "Wheat (गेहूं / गहू)",
    practices: [
      {
        title: "Seed Treatment (Beejamrit)",
        description: "Treat seeds with Beejamrit (cow urine, dung, lime water mix) or Trichoderma viride (5g/kg seed) 24 hours prior to sowing to prevent root rot and loose smut.",
      },
      {
        title: "Soil Preparation & Basal Nutrition",
        description: "Incorporate well-decomposed Farmyard Manure (FYM) @ 8-10 tonnes/hectare or Vermicompost @ 2.5 tonnes/hectare 2-3 weeks before sowing during last ploughing.",
      },
      {
        title: "Crop Rotation & Intercropping",
        description: "Rotate with leguminous green manure crops like Dhaincha or Sunhemp, or intercrop with Chickpea / Mustard to enhance soil nitrogen naturally.",
      },
      {
        title: "Irrigation & Moisture Management",
        description: "Maintain optimum moisture during Crown Root Initiation (CRI) and Flowering stages using light sprinkler or furrow irrigation to minimize fungal growth.",
      },
    ],
    compost: [
      {
        name: "Vermicompost",
        dosage: "2.5 - 3.0 Tonnes / Hectare",
        timing: "Basal application at final land preparation",
        purpose: "Provides readily available macro and micronutrients; stimulates soil microbial activity.",
        usage: "Broadcast evenly and mix into top 10-15 cm of soil.",
      },
      {
        name: "Well-Rotted Farmyard Manure (FYM)",
        dosage: "8 - 10 Tonnes / Hectare",
        timing: "20-25 days prior to sowing",
        purpose: "Improves soil humus, moisture holding capacity, and long-term carbon content.",
        usage: "Incorporate with disc harrow or cultivator; avoid fresh un-decomposed dung.",
      },
      {
        name: "Bio-Enriched Compost (Azotobacter + PSB)",
        dosage: "1.5 - 2.0 Tonnes / Hectare",
        timing: "At sowing time in seed furrows",
        purpose: "Fixes atmospheric nitrogen (20-25 kg N/ha) and solubilizes native soil phosphorus.",
        usage: "Mix 5kg Azotobacter + 5kg PSB cultures in 500kg compost before field application.",
      },
    ],
    inputs: [
      {
        name: "Jeevamrut (Liquid Ferment)",
        dosage: "500 Litres / Hectare",
        timing: "Applied every 21 days with flood/drip irrigation",
        purpose: "Supplies billions of beneficial soil microorganisms to accelerate nutrient uptake.",
      },
      {
        name: "Panchagavya Foliar Spray",
        dosage: "3% solution (30 ml per litre of water)",
        timing: "Spray at Tillering (35 DAS) and Booting (65 DAS)",
        purpose: "Acts as a potent natural growth promoter and immunity booster against climate stress.",
      },
      {
        name: "Waste Decomposer (NCOF)",
        dosage: "1000 Litres / Hectare with irrigation",
        timing: "Applied after harvest on stubble or before sowing",
        purpose: "Rapidly degrades crop residue and enhances soil biological vitality.",
      },
    ],
    pestManagement: [
      {
        target: "Termites & Soil Grubs",
        remedy: "Neem Cake @ 250 kg/ha in soil + Metarhizium anisopliae bio-insecticide @ 5 kg/ha.",
        guidance: "Apply during field preparation before sowing.",
      },
      {
        target: "Aphids & Jassids",
        remedy: "Neem Oil (10,000 ppm) @ 3-5 ml/L water or 5% Neem Seed Kernel Extract (NSKE).",
        guidance: "Spray in evening hours upon first appearance of colonies on upper leaves.",
      },
      {
        target: "Rusts & Leaf Blight",
        remedy: "Sour Buttermilk (Khatta Chhachh) @ 50 ml/L water fermented in copper pot.",
        guidance: "Natural copper ions in fermented buttermilk suppress fungal spore germination.",
      },
    ],
    precautions: [
      "Never mix chemical fertilizers or pesticides with organic microbial inoculants.",
      "Ensure compost is thoroughly decomposed (dark brown, earthy smell) to prevent weed seeds and root burns.",
      "Maintain a 3-metre buffer border if adjacent fields use synthetic chemicals.",
    ],
  },
  Rice: {
    crop: "Rice",
    label: "Rice / Paddy (धान / तांदूळ)",
    practices: [
      {
        title: "Seed Treatment & Nursery Preparation",
        description: "Soak paddy seeds in 3% Beejamrit solution or Pseudomonas fluorescens (10g/kg) for 12 hours before sprouting to control seed-borne blast and blight.",
      },
      {
        title: "Green Manuring (In-Situ)",
        description: "Grow Sesbania (Dhaincha) or Crotalaria (Sunhemp) for 45 days and incorporate into puddled soil 7-10 days before transplanting.",
      },
      {
        title: "Azolla Bio-Fertilizer Dual Cropping",
        description: "Inoculate Azolla pinnata @ 1 tonne/ha 7 days after transplanting. It fixes 30-40 kg N/ha while suppressing weed growth.",
      },
    ],
    compost: [
      {
        name: "Paddy Straw Vermicompost",
        dosage: "3 Tonnes / Hectare",
        timing: "During primary puddling",
        purpose: "Recycles silica and potassium back into the paddy field soil matrix.",
        usage: "Spread uniformly across puddled beds before leveling.",
      },
      {
        name: "FYM with Neem Cake Blending",
        dosage: "8 Tonnes FYM + 200 kg Neem Cake / Hectare",
        timing: "2 weeks prior to transplanting",
        purpose: "Nitrification inhibitor that prevents nitrogen leaching in submerged conditions.",
        usage: "Mix thoroughly into muddy soil.",
      },
    ],
    inputs: [
      {
        name: "Jeevamrut Flood Application",
        dosage: "500 Litres / Hectare",
        timing: "Every 15-20 days with standing water",
        purpose: "Releases dissolved organic nutrients and enriches microbial biomass.",
      },
      {
        name: "Blue Green Algae (BGA) / Nostoc",
        dosage: "10 kg / Hectare flake culture",
        timing: "10 days after transplanting in standing water",
        purpose: "Fixes biological nitrogen under flooded paddy conditions.",
      },
    ],
    pestManagement: [
      {
        target: "Yellow Stem Borer",
        remedy: "Install Pheromone Traps @ 12 traps/ha + Trichogramma japonicum egg parasitoids @ 100,000/ha.",
        guidance: "Release parasitoids weekly from 30 days after transplanting.",
      },
      {
        target: "Brown Plant Hopper (BPH)",
        remedy: "Agniastra or Dashparni Ark @ 30 ml/L + open alleyways every 2 metres for aeration.",
        guidance: "Direct spray towards the base of the plant canopy.",
      },
      {
        target: "Bacterial Leaf Blight (BLB)",
        remedy: "Cow urine spray (10% solution) + fermented butter milk (5%).",
        guidance: "Spray at 10-day intervals on cloudless mornings.",
      },
    ],
    precautions: [
      "Drain water periodically (Alternate Wetting and Drying) to prevent root rotting and methane build-up.",
      "Strictly avoid water runoff from conventional neighboring fields into organic paddy plots.",
    ],
  },
  Soybean: {
    crop: "Soybean",
    label: "Soybean (सोयाबीन)",
    practices: [
      {
        title: "Rhizobium & PSB Inoculation",
        description: "Inoculate seeds with Bradyrhizobium japonicum + Phosphate Solubilizing Bacteria (PSB) @ 10g/kg seed with jaggery gum solution for nodulation.",
      },
      {
        title: "Broad Bed & Furrow (BBF) Sowing",
        description: "Sow on raised beds to ensure proper drainage and root aeration during high rainfall, avoiding root rot.",
      },
    ],
    compost: [
      {
        name: "Phospho-Compost / Rock Phosphate Blended FYM",
        dosage: "5 Tonnes / Hectare",
        timing: "Before sowing",
        purpose: "Critical phosphorus supply for root nodules and oil synthesis.",
        usage: "Mix 100kg rock phosphate per tonne of manure during composting.",
      },
      {
        name: "Vermicompost",
        dosage: "2 Tonnes / Hectare",
        timing: "At final land preparation",
        purpose: "Provides trace minerals (Zinc, Molybdenum, Iron) essential for nitrogen fixation.",
        usage: "Apply in seed rows.",
      },
    ],
    inputs: [
      {
        name: "Panchagavya Foliar Feed",
        dosage: "3% solution (30 ml / L water)",
        timing: "At pre-flowering (30 DAS) and pod formation (55 DAS)",
        purpose: "Significantly enhances flower retention and pod development.",
      },
      {
        name: "Trichoderma harzianum Soil Application",
        dosage: "5 kg / Hectare mixed in 200 kg compost",
        timing: "Applied to soil before sowing",
        purpose: "Biological control against collar rot and Rhizoctonia root rot.",
      },
    ],
    pestManagement: [
      {
        target: "Girdle Beetle & Semilooper",
        remedy: "Bacillus thuringiensis (Bt) @ 2g/L water or Beauveria bassiana @ 5g/L + Neem Oil 10,000 ppm.",
        guidance: "Spray at early larval instar stages.",
      },
      {
        target: "Whitefly & Mosaic Vector",
        remedy: "Yellow Sticky Traps @ 25 traps/ha + 5% Dashparni Ark spray.",
        guidance: "Install traps at crop canopy height.",
      },
    ],
    precautions: [
      "Never expose inoculated Rhizobium seeds to direct scorching sunlight.",
      "Soybean is highly sensitive to waterlogging; ensure clean drainage channels.",
    ],
  },
  Onion: {
    crop: "Onion",
    label: "Onion (प्याज / कांदा)",
    practices: [
      {
        title: "Seedling Root Dip",
        description: "Dip seedling roots in a slurry of Azospirillum + PSB + Trichoderma (50g each in 10L water) for 30 minutes before field transplanting.",
      },
      {
        title: "Raised Bed Transplanting",
        description: "Transplant on 15cm raised beds with drip irrigation to avoid bulb rot and purple blotch.",
      },
    ],
    compost: [
      {
        name: "Poultry / Sheep Manure Compost (Cured)",
        dosage: "4 Tonnes / Hectare",
        timing: "3 weeks before transplanting",
        purpose: "High potassium and sulfur content for robust bulb pungency and firmness.",
        usage: "Ensure 90-day curing to eliminate pathogens.",
      },
      {
        name: "Vermicompost with Wood Ash",
        dosage: "2.5 Tonnes Vermicompost + 200 kg Wood Ash / Ha",
        timing: "Basal application",
        purpose: "Wood ash provides natural potassium and silica to strengthen bulb skin layers.",
        usage: "Incorporate into top soil layer.",
      },
    ],
    inputs: [
      {
        name: "Jeevamrut Drenching",
        dosage: "500 L / Ha",
        timing: "At 15, 30, and 45 days after transplanting",
        purpose: "Maintains high soil rhizosphere fertility during bulb enlargement.",
      },
      {
        name: "Liquid Seaweed Extract",
        dosage: "2 ml / L water",
        timing: "Bulb initiation stage (40-50 DAT)",
        purpose: "Stimulates uniform bulb sizing and enhances post-harvest storage life.",
      },
    ],
    pestManagement: [
      {
        target: "Onion Thrips",
        remedy: "Blue Sticky Traps @ 20/ha + Verticillium lecanii bio-agent @ 5g/L water + Neem Oil.",
        guidance: "Spray deep into leaf sheaths where thrips hide.",
      },
      {
        target: "Purple Blotch & Stemphylium Blight",
        remedy: "Trichoderma viride foliar spray @ 5g/L + copper pot fermented buttermilk.",
        guidance: "Spray preventively when cloudy, humid weather persists.",
      },
    ],
    precautions: [
      "Stop irrigation 10-15 days prior to harvest to allow outer skins to cure naturally.",
      "Store harvested bulbs in well-ventilated, shaded storage racks away from moisture.",
    ],
  },
};

export const DEFAULT_ORGANIC_GUIDE = {
  crop: "General Crops",
  label: "General Crops (सामान्य फसलें)",
  practices: [
    {
      title: "Crop Diversity & Rotation",
      description: "Never sow the same botanical family consecutively. Rotate cereals with legumes to maintain natural nitrogen balance.",
    },
    {
      title: "Organic Mulching",
      description: "Cover open soil with dried crop residues, leaves, or straw (5-7 cm layer) to conserve moisture, prevent weeds, and moderate soil temperature.",
    },
    {
      title: "Biological Seed Treatment",
      description: "Treat seeds with biofertilizers (Rhizobium, Azotobacter, PSB) and bio-fungicides (Trichoderma) before sowing.",
    },
  ],
  compost: [
    {
      name: "Vermicompost",
      dosage: "2 - 3 Tonnes / Hectare",
      timing: "Basal application at sowing",
      purpose: "Rich in humic acid, earthworm casts, and beneficial enzymes.",
      usage: "Broadcast and mix with cultivator.",
    },
    {
      name: "Well-Rotted Farmyard Manure (FYM)",
      dosage: "8 - 10 Tonnes / Hectare",
      timing: "3-4 weeks before sowing",
      purpose: "Builds soil organic carbon and enhances microbial biodiversity.",
      usage: "Spread evenly over the field.",
    },
  ],
  inputs: [
    {
      name: "Jeevamrut Fermentation",
      dosage: "500 Litres / Hectare",
      timing: "Every 2-3 weeks with irrigation",
      purpose: "Revitalizes native soil beneficial microbes.",
    },
    {
      name: "Neem Seed Kernel Extract (NSKE 5%)",
      dosage: "50 g crushed neem seeds per litre water",
      timing: "Every 15 days as protective spray",
      purpose: "Natural deterrent against sucking and chewing insects.",
    },
  ],
  pestManagement: [
    {
      target: "Sucking Pests (Aphids, Jassids, Mites)",
      remedy: "Neem Oil 10,000 ppm @ 3-5 ml/L water or Dashparni Ark @ 30 ml/L.",
      guidance: "Spray in early morning or late evening.",
    },
    {
      target: "Soil-Borne Fungal Pathogens",
      remedy: "Trichoderma viride @ 5 kg/ha mixed with 200 kg moist compost.",
      guidance: "Apply to moist soil before sowing.",
    },
  ],
  precautions: [
    "Strictly avoid synthetic chemical sprays and synthetic nitrogenous fertilizers.",
    "Maintain clean farm equipment to avoid cross-contamination.",
  ],
};

export const CERTIFICATION_GUIDANCE = {
  overview: "In India, organic produce is officially verified under two government-recognized certification systems governed by APEDA and the Ministry of Agriculture.",
  types: [
    {
      code: "PGS-India",
      name: "Participatory Guarantee System for India (PGS-India)",
      body: "Ministry of Agriculture & Farmers Welfare",
      bestFor: "Individual Farmers, Smallholders & FPO Collectives selling in the domestic Indian market.",
      cost: "Very low / Free through Local Groups (LG) and Regional Councils (RC).",
      stages: [
        "Year 1: PGS-Green (Conversion Phase 1)",
        "Year 2: PGS-Green (Conversion Phase 2)",
        "Year 3: PGS-Green (Conversion Phase 3)",
        "Year 3+: PGS-India Certified Organic (Full Certification)",
      ],
      features: [
        "Peer review by neighboring certified farmers in the Local Group.",
        "Zero expensive third-party inspection fees.",
        "Official QR-coded PGS-India Green / Organic certificate issuance.",
      ],
    },
    {
      code: "NPOP",
      name: "National Programme for Organic Production (NPOP)",
      body: "APEDA, Ministry of Commerce and Industry",
      bestFor: "Commercial Exporters, Enterprise Processors, and large institutional supply chains.",
      cost: "Moderate to High (Third-party accredited certification bodies like Aditi, OneCert, Lacon, Cuval).",
      stages: [
        "Year 1: In-Conversion (C1)",
        "Year 2: In-Conversion (C2)",
        "Year 3: In-Conversion (C3)",
        "Year 3+: NPOP Certified Organic (India Organic Logo)",
      ],
      features: [
        "Accredited international equivalence (EU, USDA NOP, Switzerland).",
        "Mandatory for international exports and high-end retail chains.",
        "TraceNet digital traceability portal registration.",
      ],
    },
  ],
  stepsToCertify: [
    {
      step: 1,
      title: "Group Formation / Registry",
      desc: "Join an existing local farmer group (FPO / Local Group) or register your farm on the PGS-India portal (pgsindia-ncof.gov.in) with Aadhaar and land record (Khasra/Khatauni).",
    },
    {
      step: 2,
      title: "Conversion Period & Farm Diary",
      desc: "Maintain a daily farm diary recording all natural inputs, compost applications, and seed sources. Abstain completely from synthetic chemicals.",
    },
    {
      step: 3,
      title: "Peer Appraisal & Soil Testing",
      desc: "Fellow group members and your local Krishi Vigyan Kendra (KVK) conduct annual field audits and verify zero chemical pesticide residues.",
    },
    {
      step: 4,
      title: "Certificate Issuance & KrishiLink Verification",
      desc: "Receive your official Certificate ID and upload it on KrishiLink to unlock the '🌱 Certified Organic ✓' badge on your produce lots.",
    },
  ],
};
