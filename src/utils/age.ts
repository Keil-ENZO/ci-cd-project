/**
 * Checks if a person is 18 or older based on a birth date.
 * @param {string | Date} birth - Birth date (string YYYY-MM-DD or Date object).
 * @returns {boolean} - True if 18 or older.
 */
export function checkAge(birth: string | Date): boolean {
  if (!birth) return false;

  const birthDate = typeof birth === 'string' ? new Date(birth) : birth;

  if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
    return false;
  }

  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  return age >= 18;
}