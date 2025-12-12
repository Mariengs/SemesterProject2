import { getAccessToken, API_KEY, BASE_URL } from "./auth.js";

const PROFILES_URL = `${BASE_URL}auction/profiles`;

/**
 * Fetch a user's profile
 * @param {string} username - The username to fetch
 * @returns {Promise<Object>} The profile data
 */
export async function fetchUserProfile(username) {
  const token = getAccessToken();

  try {
    const response = await fetch(
      `${PROFILES_URL}/${username}?_listings=true&_wins=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
      throw new Error("No profile data returned");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

/**
 * Update a user's profile
 * @param {string} username - The username to update
 * @param {Object} updates - The profile updates (bio, avatar, banner)
 * @returns {Promise<Object>} The updated profile data
 */
export async function updateUserProfile(username, updates) {
  const token = getAccessToken();

  try {
    const response = await fetch(`${PROFILES_URL}/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Delete a listing
 * @param {string} listingId - The ID of the listing to delete
 * @returns {Promise<void>}
 */
export async function deleteListingAPI(listingId) {
  const token = getAccessToken();

  try {
    const response = await fetch(`${BASE_URL}auction/listings/${listingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete listing");
    }
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
}
