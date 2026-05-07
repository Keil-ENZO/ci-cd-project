/**
 * Checks if an email address is valid using a regular expression.
 * @param {string} mail - Email address to validate.
 * @returns {boolean} - True if the email address is valid.
 */
export function checkMail(mail: string): boolean {
    if (typeof mail !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail);
}