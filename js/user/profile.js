import { fetchUserProfile, deleteListingAPI } from "../api/profileApi.js";
import { createProfileCard, renderListings } from "../ui/profileUI.js";
import {
  getUsernameFromURL,
  isOwnProfile,
  navigateToEditProfile,
  navigateToCreateListing,
  navigateToListing,
  navigateToEditListing,
  showError,
  showSuccess,
  confirmAction,
} from "../helpers/profileHelpers.js";

import { updateNavbarForUser, toggleMenu } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";
import { updateNavVisibility } from "../ui/authHelpers.js";

/**
 * Handle edit listing button click
 * @param {string} listingId - The listing ID
 */
function handleEditListing(listingId) {
  navigateToEditListing(listingId);
}

/**
 * Handle delete listing button click
 * @param {string} listingId - The listing ID
 */
async function handleDeleteListing(listingId) {
  const confirmed = confirmAction(
    "Are you sure you want to delete this listing? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    await deleteListingAPI(listingId);
    showSuccess("Listing deleted successfully!");
    // Reload the profile to show updated listings
    window.location.reload();
  } catch (error) {
    showError(error.message || "Failed to delete listing");
  }
}

/**
 * Handle view listing button click
 * @param {string} listingId - The listing ID
 */
function handleViewListing(listingId) {
  navigateToListing(listingId);
}

/**
 * Load and display profile
 */
async function loadProfile() {
  const username = getUsernameFromURL();

  if (!username) {
    showError("No username provided in URL");
    return;
  }

  const container = document.getElementById("profileContainer");

  if (!container) {
    console.error("Profile container not found");
    return;
  }

  // Show loading state
  container.innerHTML =
    '<p class="text-gray-400 text-center">Loading profile...</p>';

  try {
    // Fetch profile data
    const profile = await fetchUserProfile(username);
    const isOwner = isOwnProfile(username);

    // Clear container
    container.innerHTML = "";

    // Create and append profile card
    const profileCard = createProfileCard(profile, isOwner, {
      onEditProfile: () => navigateToEditProfile(username),
      onCreateListing: navigateToCreateListing,
    });

    container.appendChild(profileCard);

    // Create listings section
    const listingsSection = document.createElement("section");
    listingsSection.className = "mt-8";

    const listingsTitle = document.createElement("h2");
    listingsTitle.className = "text-2xl font-bold text-white mb-4";
    listingsTitle.textContent = isOwner
      ? "My Listings"
      : `${username}'s Listings`;

    const listingsGrid = document.createElement("div");
    listingsGrid.id = "listingsGrid";
    listingsGrid.className =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

    listingsSection.append(listingsTitle, listingsGrid);
    container.appendChild(listingsSection);

    // Render listings
    if (profile.listings) {
      renderListings(profile.listings, listingsGrid, isOwner, {
        onEdit: handleEditListing,
        onDelete: handleDeleteListing,
        onView: handleViewListing,
      });
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    container.innerHTML = `
      <div class="text-center text-red-500 p-8">
        <p class="text-xl font-semibold mb-2">Failed to load profile</p>
        <p class="text-gray-400">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Initialize page
 */
function initializePage() {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  fetchAndDisplayCredits();
  updateNavVisibility();
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
  loadProfile();
});
