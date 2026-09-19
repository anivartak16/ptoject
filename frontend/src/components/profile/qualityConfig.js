/**
 * CROP_QUALITY_CONFIG:
 * Standardized, crop-specific quality parameters aligning with Agmarknet / e-NAM mandi protocols.
 */
export const CROP_QUALITY_CONFIG = {
  Wheat: {
    name: "Wheat",
    label: "Wheat (गेहूं / गहू)",
    grades: [
      "Grade 1 (Premium / Sharbati)",
      "FAQ (Fair Average Quality)",
      "Grade 2 (Mill Quality)",
      "Super Grade",
    ],
    varieties: [
      "Sharbati",
      "Lokwan",
      "Mill Quality (Tukdi)",
      "Malavraj (Durum)",
      "Desi / Khapli",
      "Sujata",
    ],
    colors: ["Amber Lustrous", "Golden Yellow", "Light Brown"],
    sizes: ["Bold / Large Grain", "Medium Grain", "Small Grain"],
    measurable: [
      {
        key: "moisturePercent",
        label: "Max Moisture",
        unit: "%",
        min: 5,
        max: 15,
        default: 12.0,
        step: 0.1,
        required: true,
        help: "Standard mandi max tolerance is 12.0%",
      },
      {
        key: "foreignMatterPercent",
        label: "Max Foreign Matter",
        unit: "%",
        min: 0,
        max: 5,
        default: 1.0,
        step: 0.1,
        required: true,
        help: "Organic & inorganic non-grain matter (max 1.0%)",
      },
      {
        key: "damagedGrainsPercent",
        label: "Max Damaged Grains",
        unit: "%",
        min: 0,
        max: 8,
        default: 2.0,
        step: 0.1,
        required: true,
        help: "Weevilled, discolored or broken kernels (max 2.0%)",
      },
    ],
  },
  Rice: {
    name: "Rice",
    label: "Rice / Paddy (धान / तांदूळ)",
    grades: [
      "Premium Grade 1",
      "FAQ (Fair Average Quality)",
      "Common Grade",
      "Super Fine",
    ],
    varieties: [
      "Basmati 1121",
      "Pusa Basmati",
      "Sona Masoori",
      "Kolam",
      "IR 64",
      "Parmal",
      "Swarna",
    ],
    colors: ["Translucent Pearl White", "Creamy White", "Light Brown / Unpolished"],
    sizes: [
      "Extra Long Grain (> 7.2mm)",
      "Long Grain (6.6 - 7.2mm)",
      "Medium Grain (5.5 - 6.6mm)",
      "Short Grain (< 5.5mm)",
    ],
    measurable: [
      {
        key: "moisturePercent",
        label: "Max Moisture",
        unit: "%",
        min: 5,
        max: 16,
        default: 13.5,
        step: 0.1,
        required: true,
        help: "Safe milling tolerance is ≤ 14.0%",
      },
      {
        key: "brokenGrainsPercent",
        label: "Max Broken Grains",
        unit: "%",
        min: 0,
        max: 25,
        default: 5.0,
        step: 0.5,
        required: true,
        help: "Broken grain percentage (max 5.0%)",
      },
      {
        key: "foreignMatterPercent",
        label: "Max Foreign Matter",
        unit: "%",
        min: 0,
        max: 5,
        default: 1.0,
        step: 0.1,
        required: true,
        help: "Non-rice impurities (max 1.0%)",
      },
      {
        key: "damagedGrainsPercent",
        label: "Max Damaged / Discolored",
        unit: "%",
        min: 0,
        max: 8,
        default: 2.0,
        step: 0.1,
        required: true,
        help: "Chalky, heat-damaged or discolored grains",
      },
    ],
  },
  Soybean: {
    name: "Soybean",
    label: "Soybean (सोयाबीन)",
    grades: [
      "Grade 1 (Processing / Oil Mill)",
      "FAQ (Fair Average Quality)",
      "Grade 2 (Feed Quality)",
    ],
    varieties: [
      "JS 335",
      "JS 9560",
      "JS 20-34",
      "NRC 37",
      "Yellow Soybean",
      "RVS 2001-4",
    ],
    colors: ["Bright Yellow", "Light Amber Yellow", "Pale Yellow"],
    sizes: ["Bold", "Medium", "Standard"],
    measurable: [
      {
        key: "moisturePercent",
        label: "Max Moisture",
        unit: "%",
        min: 5,
        max: 14,
        default: 10.0,
        step: 0.1,
        required: true,
        help: "Safe storage tolerance is ≤ 10.0%",
      },
      {
        key: "foreignMatterPercent",
        label: "Max Foreign Matter",
        unit: "%",
        min: 0,
        max: 5,
        default: 2.0,
        step: 0.1,
        required: true,
        help: "Pod fragments, dirt, weed seeds (max 2.0%)",
      },
      {
        key: "damagedGrainsPercent",
        label: "Max Damaged / Shriveled",
        unit: "%",
        min: 0,
        max: 10,
        default: 3.0,
        step: 0.1,
        required: true,
        help: "Immature, shriveled, or split seeds (max 3.0%)",
      },
      {
        key: "oilContentPercent",
        label: "Min Oil Content",
        unit: "%",
        min: 14,
        max: 24,
        default: 18.0,
        step: 0.5,
        required: false,
        help: "Crude oil yield percentage (standard is ≥ 18.0%)",
      },
    ],
  },
  Maize: {
    name: "Maize",
    label: "Maize / Corn (मक्का / मका)",
    grades: [
      "Grade 1 (Poultry / Starch Feed)",
      "FAQ (Mandi Standard)",
      "Grade 2 (Industrial)",
    ],
    varieties: [
      "Yellow Dent",
      "Flint Corn",
      "Hybrid Pioneer",
      "Sweet Corn / Table",
    ],
    colors: ["Bright Yellow", "Deep Orange Yellow", "Pale Yellow"],
    sizes: ["Standard Grain", "Large Kernel"],
    measurable: [
      {
        key: "moisturePercent",
        label: "Max Moisture",
        unit: "%",
        min: 5,
        max: 18,
        default: 14.0,
        step: 0.1,
        required: true,
        help: "Mandi procurement standard is ≤ 14.0%",
      },
      {
        key: "foreignMatterPercent",
        label: "Max Foreign Matter",
        unit: "%",
        min: 0,
        max: 5,
        default: 1.5,
        step: 0.1,
        required: true,
        help: "Inorganic & organic dirt (max 1.5%)",
      },
      {
        key: "damagedGrainsPercent",
        label: "Max Damaged / Weevilled",
        unit: "%",
        min: 0,
        max: 10,
        default: 3.0,
        step: 0.1,
        required: true,
        help: "Insect-bored or moldy kernels (max 3.0%)",
      },
    ],
  },
  Onion: {
    name: "Onion",
    label: "Onion (प्याज / कांदा)",
    grades: [
      "Export Quality (Grade 1)",
      "A-Grade (Domestic Market)",
      "B-Grade / Medium",
      "FAQ Mandi Standard",
    ],
    varieties: [
      "Nashik Red",
      "Garwa (Rabi / Storage)",
      "White Onion",
      "Pusa Red",
      "Agrifound Dark Red",
    ],
    colors: ["Deep Dark Red", "Pinkish Red", "White", "Light Red"],
    sizes: ["Jumbo (> 60mm)", "Medium (45 - 60mm)", "Golta / Small (30 - 45mm)"],
    measurable: [
      {
        key: "foreignMatterPercent",
        label: "Max Rotten / Defective",
        unit: "%",
        min: 0,
        max: 10,
        default: 2.0,
        step: 0.5,
        required: true,
        help: "Rotten, neck-rot or decayed bulbs (max 2.0%)",
      },
      {
        key: "damagedGrainsPercent",
        label: "Max Sprouted / Doubled",
        unit: "%",
        min: 0,
        max: 10,
        default: 1.0,
        step: 0.5,
        required: true,
        help: "Premature sprouted or double bulbs (max 1.0%)",
      },
    ],
  },
  Tomato: {
    name: "Tomato",
    label: "Tomato (टमाटर / टोमॅटो)",
    grades: [
      "Grade A (Table / Retail)",
      "Processing / Pulp Grade",
      "Grade B (Mandi General)",
    ],
    varieties: [
      "Hybrid Abhinav / US 440",
      "Vaishali",
      "Himsona",
      "Desi / Local",
    ],
    colors: [
      "Deep Uniform Red (Fully Ripe)",
      "Pink / Turning Red (Semi-Ripe)",
      "Greenish Red (Long Transit)",
    ],
    sizes: ["Large (> 60mm)", "Medium (45 - 60mm)", "Small (< 45mm)"],
    measurable: [
      {
        key: "damagedGrainsPercent",
        label: "Max Blemish / Soft Rots",
        unit: "%",
        min: 0,
        max: 15,
        default: 3.0,
        step: 0.5,
        required: true,
        help: "Cracked skin, insect bites, or soft rot (max 3.0%)",
      },
    ],
  },
  Cotton: {
    name: "Cotton",
    label: "Cotton (कपास / कापूस)",
    grades: [
      "Extra Long Staple (ELS)",
      "Long Staple Grade A",
      "Medium Staple FAQ",
    ],
    varieties: ["Bt Cotton", "Shankar 6", "MCU 5", "DCH 32", "Bunny"],
    colors: ["Bright White", "Creamy White", "Light Grayish"],
    sizes: ["Staple: 28mm+", "Staple: 29 - 30mm", "Staple: 31mm+"],
    measurable: [
      {
        key: "moisturePercent",
        label: "Max Moisture",
        unit: "%",
        min: 4,
        max: 12,
        default: 8.5,
        step: 0.1,
        required: true,
        help: "Standard ginning moisture tolerance is ≤ 8.5%",
      },
      {
        key: "foreignMatterPercent",
        label: "Max Trash / Foreign Matter",
        unit: "%",
        min: 0,
        max: 8,
        default: 3.0,
        step: 0.1,
        required: true,
        help: "Leaf, bract, and stalk trash (max 3.0%)",
      },
    ],
  },
  Gram: {
    name: "Gram",
    label: "Gram / Chana (चना / हरभरा)",
    grades: [
      "Grade 1 (Processing / Dal Mill)",
      "FAQ (Mandi Standard)",
      "Grade 2",
    ],
    varieties: [
      "Desi Chana",
      "Kabuli / Dollar Chana",
      "JG 11",
      "Vishal / Digvijay",
    ],
    colors: ["Brownish Yellow", "Light Cream (Kabuli)", "Deep Brown"],
    sizes: ["Bold Count (40 - 42)", "Medium Count (44 - 46)", "Small / Regular"],
    measurable: [
      {
        key: "moisturePercent",
        label: "Max Moisture",
        unit: "%",
        min: 5,
        max: 14,
        default: 10.0,
        step: 0.1,
        required: true,
        help: "Standard storage moisture is ≤ 10.0%",
      },
      {
        key: "foreignMatterPercent",
        label: "Max Foreign Matter",
        unit: "%",
        min: 0,
        max: 5,
        default: 1.0,
        step: 0.1,
        required: true,
        help: "Dust, stones, chaff (max 1.0%)",
      },
      {
        key: "damagedGrainsPercent",
        label: "Max Damaged / Weevilled",
        unit: "%",
        min: 0,
        max: 8,
        default: 2.0,
        step: 0.1,
        required: true,
        help: "Broken, shriveled, or weevilled grains (max 2.0%)",
      },
    ],
  },
};

export const DEFAULT_CROP_CONFIG = {
  name: "General",
  label: "General Commodity",
  grades: [
    "Grade 1 / Premium",
    "FAQ (Fair Average Quality)",
    "Grade 2 / Commercial",
  ],
  varieties: ["Standard Commercial", "Hybrid Quality", "Desi / Local"],
  colors: ["Natural Standard", "Uniform Bright"],
  sizes: ["Bold / Large", "Medium", "Small"],
  measurable: [
    {
      key: "moisturePercent",
      label: "Max Moisture",
      unit: "%",
      min: 0,
      max: 20,
      default: 12.0,
      step: 0.1,
      required: true,
      help: "Max permissible moisture level",
    },
    {
      key: "foreignMatterPercent",
      label: "Max Foreign Matter",
      unit: "%",
      min: 0,
      max: 10,
      default: 1.5,
      step: 0.1,
      required: true,
      help: "Foreign matter or impurities",
    },
    {
      key: "damagedGrainsPercent",
      label: "Max Damaged Grains",
      unit: "%",
      min: 0,
      max: 15,
      default: 2.0,
      step: 0.1,
      required: true,
      help: "Damaged, discolored or broken items",
    },
  ],
};

export function getCropConfig(cropName) {
  if (!cropName) return CROP_QUALITY_CONFIG.Wheat;
  const match = Object.keys(CROP_QUALITY_CONFIG).find((k) =>
    cropName.toLowerCase().includes(k.toLowerCase())
  );
  return match ? CROP_QUALITY_CONFIG[match] : DEFAULT_CROP_CONFIG;
}

export function validateQualitySpecs(specs, cropName) {
  const errors = {};
  const config = getCropConfig(cropName);

  if (!specs?.grade || !specs.grade.trim()) {
    errors.grade = "Quality Grade is required.";
  }

  if (!specs?.variety || !specs.variety.trim()) {
    errors.variety = "Crop Variety is required.";
  }

  config.measurable.forEach((field) => {
    const val = specs?.[field.key];
    if (val === undefined || val === null || val === "") {
      if (field.required) {
        errors[field.key] = `${field.label} is required.`;
      }
    } else {
      const num = Number(val);
      if (isNaN(num)) {
        errors[field.key] = "Please enter a valid number.";
      } else if (num < 0) {
        errors[field.key] = "Negative values are not permitted.";
      } else if (num < field.min) {
        errors[field.key] = `Cannot be less than ${field.min}${field.unit}.`;
      } else if (num > field.max) {
        errors[field.key] = `Cannot exceed ${field.max}${field.unit}.`;
      }
    }
  });

  if (specs?.otherRequirements && specs.otherRequirements.length > 200) {
    errors.otherRequirements = "Other Requirements cannot exceed 200 characters.";
  }

  return errors;
}

export function formatQualityRequirements(specs, cropName) {
  if (!specs) return "Grade A / FAQ Mandi Standards";
  const config = getCropConfig(cropName || specs.crop);
  const parts = [];

  const crop = specs.crop || config.name;
  if (specs.grade) parts.push(`${crop}: ${specs.grade}`);
  if (specs.variety) parts.push(`Variety: ${specs.variety}`);

  config.measurable.forEach((field) => {
    const val = specs[field.key];
    if (val !== undefined && val !== null && val !== "") {
      const isMin =
        field.key.toLowerCase().includes("oil") || field.key.toLowerCase().includes("min");
      parts.push(
        `${field.label.replace("Max ", "").replace("Min ", "")} ${isMin ? "≥" : "≤"} ${val}${field.unit}`
      );
    }
  });

  if (specs.colorAppearance) parts.push(`Color: ${specs.colorAppearance}`);
  if (specs.sizeType) parts.push(`Size: ${specs.sizeType}`);

  if (specs.otherRequirements && specs.otherRequirements.trim()) {
    parts.push(`Note: ${specs.otherRequirements.trim()}`);
  }

  return parts.join(" · ");
}
