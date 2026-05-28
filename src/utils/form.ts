/**
 * Checks if a name or first name is valid (at least 2 characters, only letters, spaces, hyphens).
 * @param {string} name - Name to validate.
 * @returns {boolean} - True if valid.
 */
export function checkName(name: string): boolean {
  if (typeof name !== 'string') return false;
  const nameRegex = /^[\p{L}\s\-']{2,}$/u;
  return nameRegex.test(name.trim());
}

/**
 * Checks if a postal code is in the French format (5 digits).
 * @param {string} cp - Postal code to validate.
 * @returns {boolean} - True if valid.
 */
export function checkCP(cp: string): boolean {
  if (typeof cp !== 'string') return false;
  const cpRegex = /^\d{5}$/;
  return cpRegex.test(cp.trim());
}
