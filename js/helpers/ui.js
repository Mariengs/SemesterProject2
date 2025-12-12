/**
 * UI helper functions for form error handling
 */

/**
 * Show error message for a specific field
 * @param {string} elementId - The ID of the error element
 * @param {string} message - The error message to display
 */
export function showErrorMessage(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

/**
 * Hide all error messages with the "error-message" class
 */
export function hideErrorMessages() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.add("hidden");
    el.textContent = "";
  });
}
