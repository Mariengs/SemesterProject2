import { REGISTER_URL } from "../api/auth.js";

/**
 * Create request body for registration
 * @param {Object} userData - User data object
 * @param {string} userData.name - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string|null} userData.bio - User bio (optional)
 * @param {string|null} userData.avatar - Avatar URL (optional)
 * @param {string|null} userData.banner - Banner URL (optional)
 * @returns {Object} - Formatted request body
 */
export function createRegisterRequestBody({
  name,
  email,
  password,
  bio,
  avatar,
  banner,
}) {
  return {
    name,
    email,
    password,
    bio: bio ?? "Default bio",
    avatar: {
      url: avatar || "https://via.placeholder.com/150",
      alt: "User avatar",
    },
    banner: {
      url: banner || "https://via.placeholder.com/600x200",
      alt: "User banner",
    },
    venueManager: true,
  };
}

/**
 * Register a new user
 * @param {Object} requestBody - The formatted registration request body
 * @returns {Promise<Object>} - The registration response data
 * @throws {Error} - If registration fails
 */
export async function registerUser(requestBody) {
  const response = await fetch(REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || response.statusText);
  }

  return await response.json();
}
