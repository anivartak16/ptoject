/**
 * Verhoeff Algorithm Implementation for Aadhaar Number Validation (UIDAI Standard)
 * 
 * Aadhaar numbers are 12-digit unique identity numbers where the 12th digit
 * is a Verhoeff checksum digit computed over the first 11 digits.
 * This detects all single-digit errors and all transposition errors of adjacent digits.
 */

// Multiplication table (d)
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table (p)
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Inverse table (inv)
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a number string using the Verhoeff checksum algorithm.
 * @param {string} numStr 
 * @returns {boolean}
 */
export function validateVerhoeff(numStr) {
  if (!numStr || typeof numStr !== "string") return false;
  let c = 0;
  const reversedArray = numStr.split("").map(Number).reverse();
  for (let i = 0; i < reversedArray.length; i++) {
    const digit = reversedArray[i];
    if (isNaN(digit)) return false;
    c = d[c][p[i % 8][digit]];
  }
  return c === 0;
}

/**
 * Computes the Verhoeff checksum digit for a given number string.
 * @param {string} numStr 
 * @returns {number}
 */
export function generateVerhoeff(numStr) {
  let c = 0;
  const reversedArray = numStr.split("").map(Number).reverse();
  for (let i = 0; i < reversedArray.length; i++) {
    c = d[c][p[(i + 1) % 8][reversedArray[i]]];
  }
  return inv[c];
}

/**
 * Validates a 12-digit Indian Aadhaar number according to UIDAI specifications:
 * 1. Must be numeric only and exactly 12 digits.
 * 2. Cannot begin with 0 or 1.
 * 3. Must satisfy the Verhoeff checksum.
 * 
 * @param {string|number} aadhaar 
 * @returns {{ valid: boolean, error?: string, clean?: string }}
 */
export function isValidAadhaar(aadhaar) {
  if (!aadhaar) {
    return { valid: false, error: "Aadhaar number is required" };
  }

  const clean = String(aadhaar).replace(/\D/g, "");

  if (clean.length !== 12) {
    return { valid: false, error: "Aadhaar number must be exactly 12 digits" };
  }

  if (clean.startsWith("0") || clean.startsWith("1")) {
    return { valid: false, error: "Invalid Aadhaar number (cannot begin with 0 or 1)" };
  }

  if (!validateVerhoeff(clean)) {
    return { valid: false, error: "Invalid Aadhaar number: checksum verification failed" };
  }

  return { valid: true, clean };
}
