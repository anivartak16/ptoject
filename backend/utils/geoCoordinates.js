/**
 * Indian District Coordinates & Geospatial Proximity Utility
 * Coordinates format: [longitude, latitude] (GeoJSON standard)
 */

export const DISTRICT_COORDINATES = {
  // MADHYA PRADESH
  "indore": [75.8577, 22.7196],
  "khandwa": [76.3498, 21.8314],
  "east nimar": [76.3498, 21.8314],
  "sagar": [78.7494, 23.8388],
  "khurai": [78.3262, 24.0435],
  "bina": [78.1818, 24.1751],
  "bhopal": [77.4126, 23.2599],
  "berasia": [77.4333, 23.6333],
  "ujjain": [75.7772, 23.1765],
  "badnagar": [75.3833, 23.0667],
  "nagda": [75.4167, 23.4500],
  "mahidpur": [75.6500, 23.4833],
  "khachrod": [75.2833, 23.4167],
  "dewas": [76.0534, 22.9676],
  "sonkatch": [76.3667, 22.9667],
  "kannod": [76.7333, 22.5667],
  "bagli": [76.3500, 22.6500],
  "dhar": [75.2968, 22.5978],
  "khargone": [75.6105, 21.8234],
  "west nimar": [75.6105, 21.8234],
  "sanawad": [76.0667, 22.1833],
  "barwani": [74.9030, 22.0366],
  "badwani": [74.9030, 22.0366],
  "harda": [77.0945, 22.3395],
  "khirkiya": [76.8500, 22.1667],
  "timarni": [77.2333, 22.3667],
  "hoshangabad": [77.7370, 22.7519],
  "narmadapuram": [77.7370, 22.7519],
  "itarsi": [77.7500, 22.6167],
  "pipariya": [78.3500, 22.7667],
  "sehore": [77.0851, 23.2032],
  "ashta": [76.5333, 23.0167],
  "ichhawar": [77.0167, 22.9500],
  "nasrullaganj": [77.2833, 22.7333],
  "vidisha": [77.8109, 23.5251],
  "ganjbasoda": [77.9333, 23.8500],
  "basoda": [77.9333, 23.8500],
  "sironj": [77.7000, 24.1000],
  "kurwai": [78.0333, 24.0333],
  "raisen": [77.7840, 23.3315],
  "goharganj": [77.6500, 23.0167],
  "bareli": [78.2333, 22.8667],
  "begamganj": [78.3333, 23.6000],
  "betul": [77.9022, 21.9014],
  "multai": [78.2500, 21.7667],
  "chhindwara": [78.9382, 22.0574],
  "pandhurna": [78.5333, 21.6000],
  "jabalpur": [79.9864, 23.1815],
  "sihora": [80.0667, 23.4833],
  "patan": [79.7000, 23.2833],
  "katni": [80.3956, 23.8343],
  "rewa": [81.3000, 24.5373],
  "satna": [80.8322, 24.6005],
  "maihar": [80.7588, 24.2706],
  "nagod": [80.6000, 24.5667],
  "gwalior": [78.1828, 26.2183],
  "dabra": [78.3333, 25.9000],
  "morena": [77.9940, 26.4948],
  "ambah": [78.2333, 26.7000],
  "bhind": [78.7885, 26.5653],
  "lahar": [78.9333, 26.1833],
  "mehgaon": [78.6167, 26.4833],
  "shivpuri": [77.6534, 25.4326],
  "kolaras": [77.6000, 24.9667],
  "karera": [78.1500, 25.4667],
  "pichhore": [78.2000, 25.1833],
  "guna": [77.3114, 24.6465],
  "aron": [77.4167, 24.3833],
  "raghogarh": [77.2000, 24.4500],
  "ashoknagar": [77.7289, 24.5772],
  "chanderi": [78.1333, 24.7167],
  "mungaoli": [78.1000, 24.4167],
  "isagarh": [77.8167, 24.8333],
  "mandsaur": [75.0667, 24.0722],
  "pipliya mandi": [75.0000, 24.2000],
  "neemuch": [74.8720, 24.4746],
  "jawad": [74.8500, 24.6000],
  "ratlam": [75.0400, 23.3341],
  "jaora": [75.1333, 23.6333],
  "rajgarh": [76.7214, 24.0062],
  "biaora": [76.9167, 23.9000],
  "narsinghgarh": [77.1000, 23.7000],
  "shajapur": [76.2774, 23.4285],
  "shujalpur": [76.7167, 23.4000],
  "kalapipal": [76.8333, 23.3333],
  "agar malwa": [76.0150, 23.7142],
  "susner": [76.0833, 23.9500],
  "alirajpur": [74.3542, 22.3040],
  "jhabua": [74.5956, 22.7699],
  "seoni": [79.5435, 22.0869],
  "lakhnadon": [79.6000, 22.6000],
  "balaghat": [80.1849, 21.8049],
  "waraseoni": [80.0500, 21.8167],
  "mandla": [80.3714, 22.5986],
  "dindori": [81.0805, 22.9555],
  "narsinghpur": [79.1976, 22.9431],
  "gadarwara": [78.7833, 22.9167],
  "kareli": [79.0667, 22.9167],
  "damoh": [79.4447, 23.8323],
  "hata": [79.6000, 24.1333],
  "panna": [80.1983, 24.7208],
  "ajaygarh": [80.2667, 24.9000],
  "chhatarpur": [79.5898, 24.9164],
  "nowgong": [79.4500, 25.0667],
  "maharajpur": [79.5000, 24.9667],
  "bada malhera": [79.2500, 24.5833],
  "tikamgarh": [78.8315, 24.7455],
  "jatara": [78.9667, 25.0167],
  "palera": [79.2333, 25.0333],
  "khargapur": [79.1333, 24.8167],
  "baldeogarh": [79.0500, 24.7833],

  // NIWARI DISTRICT & TOWNS
  "niwari": [78.5414, 25.3582],
  "niwadi": [78.5414, 25.3582],
  "prithvipur": [78.7513, 25.2155],
  "pritvipur": [78.7513, 25.2155],
  "orchha": [78.6420, 25.3510],
  "taricharkalan": [78.6833, 25.2500],

  // BUNDELKHAND / VINDHYA
  "sidhi": [81.8824, 24.4044],
  "singrauli": [82.5694, 24.2000],
  "shehdol": [81.3537, 23.2856],
  "shahdol": [81.3537, 23.2856],
  "umariya": [80.8354, 23.5245],
  "umaria": [80.8354, 23.5245],
  "anuppur": [81.6917, 23.1042],
  "sheopur": [76.6989, 25.6698],
  "datia": [78.4611, 25.6653],
  "sevda": [78.7833, 26.1500],
  "bhander": [78.7500, 25.7333],
  "burhanpur": [76.2294, 21.3145],

  // NEIGHBORING UP (BUNDELKHAND)
  "jhansi": [78.5685, 25.4484],
  "mauranipur": [79.1450, 25.2420],
  "chirgaon": [78.8250, 25.5750],
  "moth": [78.9500, 25.7167],
  "gurusarai": [79.2250, 25.6167],
  "babina": [78.4667, 25.2333],
  "lalitpur": [78.4116, 24.6896],
  "mehrauni": [78.7500, 24.3833],
  "talbehat": [78.4333, 25.0500],
  "banda": [80.3347, 25.4754],
  "atarra": [80.5667, 25.2833],
  "chitrakut": [80.8667, 25.2000],
  "mahoba": [79.8732, 25.2917],
  "charkhari": [79.7500, 25.4000],
  "hamirpur": [80.1517, 25.9544],
  "jalaun": [79.3512, 26.1478],
  "orai": [79.3512, 26.1478],

  // HARYANA
  "karnal": [76.9897, 29.6857],
  "kurukshetra": [76.8783, 29.9695],
  "ambala": [76.7794, 30.3782],
  "hisar": [75.7217, 29.1492],
  "rohtak": [76.6066, 28.8955],
  "sirsa": [75.0367, 29.5350],
  "sonipat": [77.0194, 28.9931],
  "panipat": [76.9635, 29.3909],
  "jind": [76.3197, 29.3140],
  "kaithal": [76.3996, 29.8015],
  "bhiwani": [76.1320, 28.7831],
  "rewari": [76.6180, 28.1828],
  "gurgaon": [77.0266, 28.4595],
  "gurugram": [77.0266, 28.4595],
  "faridabad": [77.3178, 28.4089],
  "fatehabad": [75.4542, 29.5160],
  "yamunanagar": [77.2674, 30.1290],
  "palwal": [77.3274, 28.1487],

  // PUNJAB
  "ludhiana": [75.8573, 30.9010],
  "amritsar": [74.8723, 31.6340],
  "jalandhar": [75.5762, 31.3260],
  "patiala": [76.3869, 30.3398],
  "bathinda": [74.9455, 30.2110],
  "bhatinda": [74.9455, 30.2110],
  "sangrur": [75.8479, 30.2458],
  "moga": [75.1734, 30.8165],
  "hoshiarpur": [75.9115, 31.5273],
  "gurdaspur": [75.4053, 32.0419],
  "nawanshahr": [76.1202, 31.1256],
  "tarntaran": [74.9272, 31.4520],

  // MAHARASHTRA
  "pune": [73.8567, 18.5204],
  "nashik": [73.7898, 19.9975],
  "nagpur": [79.0882, 21.1458],
  "ahmednagar": [74.7496, 19.0948],
  "aurangabad": [75.3433, 19.8762],
  "chhatrapati sambhajinagar": [75.3433, 19.8762],
  "solapur": [75.9064, 17.6599],
  "kolhapur": [74.2433, 16.7050],
  "jalgaon": [75.5626, 21.0077],
  "amravati": [77.7523, 20.9320],
  "latur": [76.5604, 18.4088],

  // UTTAR PRADESH
  "lucknow": [80.9462, 26.8467],
  "kanpur": [80.3319, 26.4499],
  "kanpur dehat": [79.9149, 26.4568],
  "agra": [78.0081, 27.1767],
  "varanasi": [82.9739, 25.3176],
  "prayagraj": [81.8463, 25.4358],
  "allahabad": [81.8463, 25.4358],
  "meerut": [77.7064, 28.9845],
  "bareilly": [79.4304, 28.3670],
  "aligarh": [78.0777, 27.8974],
  "gorakhpur": [83.3732, 26.7606],
  "mathura": [77.6737, 27.4924],
  "moradabad": [78.7768, 28.8386],
  "ayodhya": [82.1998, 26.7922],
  "faizabad": [82.1998, 26.7922],
  "saharanpur": [77.5410, 29.9640],
  "firozabad": [78.3957, 27.1591],
  "muzaffarnagar": [77.7060, 29.4727],

  // TAMIL NADU
  "dharmapuri": [78.1598, 12.1211],
  "dindigul": [77.9803, 10.3673],
  "erode": [77.7172, 11.3410],
  "kancheepuram": [79.7036, 12.8342],
  "krishnagiri": [78.2138, 12.5186],
  "madurai": [78.1198, 9.9252],
  "salem": [78.1460, 11.6643],
  "tiruppur": [77.3411, 11.1085],
  "tirunelveli": [77.7567, 8.7139],
  "chennai": [80.2707, 13.0827],
  "coimbatore": [76.9558, 11.0168],

  // RAJASTHAN
  "jaipur": [75.7873, 26.9124],
  "kota": [75.8648, 25.2138],
  "jodhpur": [73.0243, 26.2389],
  "bikaner": [73.3119, 28.0229],
  "sri ganganagar": [73.8789, 29.9038],

  // GUJARAT
  "ahmedabad": [72.5714, 23.0225],
  "surat": [72.8311, 21.1702],
  "rajkot": [70.8022, 22.3039],
  "vadodara": [73.1812, 22.3072],
};

export const STATE_CAPITALS = {
  "madhya pradesh": [77.4126, 23.2599], // Bhopal
  "mp": [77.4126, 23.2599],
  "haryana": [76.7794, 30.7333], // Chandigarh
  "punjab": [75.8573, 30.9010], // Ludhiana
  "maharashtra": [73.8567, 18.5204], // Pune / Mumbai
  "uttar pradesh": [80.9462, 26.8467], // Lucknow
  "up": [80.9462, 26.8467],
  "tamil nadu": [80.2707, 13.0827], // Chennai
  "rajasthan": [75.7873, 26.9124], // Jaipur
  "gujarat": [72.5714, 23.0225],
  "delhi": [77.1025, 28.7041],
  "odisha": [85.8245, 20.2961],
  "andhra pradesh": [80.6480, 16.5062],
};

/**
 * Calculates great-circle distance between two [longitude, latitude] points in Kilometers.
 */
export function calculateDistanceKm([lon1, lat1], [lon2, lat2]) {
  if (!Number.isFinite(lon1) || !Number.isFinite(lat1) || !Number.isFinite(lon2) || !Number.isFinite(lat2)) {
    return 100;
  }
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians;
  const dLon = (lon2 - lon1) * radians;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * radians) *
      Math.cos(lat2 * radians) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371 * c);
}

/**
 * Normalizes place name for lookups with common transliterations
 */
export function cleanKey(str) {
  if (!str || typeof str !== "string") return "";
  let s = str
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(district|dist|mandi|apmc|market|city|sub-yard|tehsil|block|town|village|road)\b/gi, "")
    .trim();

  // Common Hindi/English transliteration normalizations
  if (s === "niwadi") s = "niwari";
  if (s === "pritvipur") s = "prithvipur";
  if (s === "barwani") s = "badwani";
  if (s === "hoshangabad") s = "narmadapuram";
  if (s === "east nimar") s = "khandwa";
  if (s === "west nimar") s = "khargone";
  return s;
}

/**
 * Resolves geographic coordinates for a given user or mandi location descriptor.
 * If user entered a specific town/district, prioritize their entered location
 * over stale browser GPS from another city.
 */
export function resolveCoordinates({ coordinates, district, state, location, address }) {
  // 1. First resolve based on the user's entered location/address/district text
  let textCoords = null;
  const locKey = cleanKey(location);
  const distKey = cleanKey(district);
  const addrKey = cleanKey(address);

  // Check specific town/city first (e.g. Prithvipur, Khurai, Bina)
  if (locKey && DISTRICT_COORDINATES[locKey]) {
    textCoords = DISTRICT_COORDINATES[locKey];
  } else if (distKey && DISTRICT_COORDINATES[distKey]) {
    textCoords = DISTRICT_COORDINATES[distKey];
  } else {
    // Check address keywords or substrings
    for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
      if (locKey && (locKey.includes(key) || key.includes(locKey))) {
        textCoords = coords;
        break;
      }
      if (distKey && (distKey.includes(key) || key.includes(distKey))) {
        textCoords = coords;
        break;
      }
      if (addrKey && addrKey.includes(key)) {
        textCoords = coords;
        break;
      }
    }
  }

  // 2. If explicit coordinates are provided:
  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1])
  ) {
    // If text-based coordinates exist for user's district/town, check for discrepancy
    if (textCoords) {
      const discrepancyKm = calculateDistanceKm(coordinates, textCoords);
      // If coordinates are > 65 km away from the entered address/district,
      // it is a stale GPS detection from another city! Favor user's entered address!
      if (discrepancyKm > 65) {
        return textCoords;
      }
    }
    return [coordinates[0], coordinates[1]];
  }

  if (textCoords) return textCoords;

  // 3. Fallback to state capital / regional center
  const stateKey = cleanKey(state);
  if (stateKey && STATE_CAPITALS[stateKey]) {
    return STATE_CAPITALS[stateKey];
  }
  for (const [key, coords] of Object.entries(STATE_CAPITALS)) {
    if (stateKey && (stateKey.includes(key) || key.includes(stateKey))) {
      return coords;
    }
  }

  // Default central India coordinate
  return [77.4126, 23.2599];
}
