/**
 * Validation helper functions
 */

/**
 * Check if a string is a valid URL
 * @param {string} string - The string to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
export function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Validate username format (letters, numbers, underscores only)
 * @param {string} name - The username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidUsername(name) {
  return name && !/[^a-zA-Z0-9_]/.test(name);
}

/**
 * Validate email format (must end with @stud.noroff.no)
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidStudEmail(email) {
  return email && email.endsWith("@stud.noroff.no");
}

/**
 * Validate password length (minimum 8 characters)
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidPassword(password) {
  return password && password.length >= 8;
}

/**
 * Validate bio length (maximum 160 characters)
 * @param {string} bio - The bio to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidBio(bio) {
  return !bio || bio.length <= 160;
}
