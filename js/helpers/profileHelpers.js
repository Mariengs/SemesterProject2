/**
 * Get username from URL query parameter
 * @returns {string|null} The username or null
 */
export function getUsernameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("name");
}

/**
 * Get current logged-in username from localStorage
 * @returns {string|null} The username or null
 */
export function getCurrentUsername() {
  return localStorage.getItem("userName");
}

/**
 * Check if viewing own profile
 * @param {string} profileUsername - The profile being viewed
 * @returns {boolean} True if viewing own profile
 */
export function isOwnProfile(profileUsername) {
  const currentUsername = getCurrentUsername();
  return currentUsername?.toLowerCase() === profileUsername?.toLowerCase();
}

/**
 * Navigate to edit profile page
 * @param {string} username - The username
 */
export function navigateToEditProfile(username) {
  window.location.href = `/html/edit-profile.html?name=${username}`;
}

/**
 * Navigate to create listing page
 */
export function navigateToCreateListing() {
  window.location.href = "/html/create-listing.html";
}

/**
 * Navigate to single listing page
 * @param {string} listingId - The listing ID
 */
export function navigateToListing(listingId) {
  window.location.href = `/html/single-listing.html?id=${listingId}`;
}

/**
 * Navigate to edit listing page
 * @param {string} listingId - The listing ID
 */
export function navigateToEditListing(listingId) {
  window.location.href = `/html/edit-listing.html?id=${listingId}`;
}

/**
 * Show error message to user
 * @param {string} message - The error message
 */
export function showError(message) {
  alert(`Error: ${message}`);
}

/**
 * Show success message to user
 * @param {string} message - The success message
 */
export function showSuccess(message) {
  alert(message);
}

/**
 * Confirm action with user
 * @param {string} message - The confirmation message
 * @returns {boolean} True if confirmed
 */
export function confirmAction(message) {
  return confirm(message);
}
