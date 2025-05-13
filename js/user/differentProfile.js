import { API_KEY } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  loadSelectedProfile();
  fetchAndDisplayCredits();
});

async function loadSelectedProfile() {
  const container = document.getElementById("profileContainer");
  const token = localStorage.getItem("accessToken");
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("name");
  const apiKey = API_KEY;

  if (!token || !userName || !apiKey) {
    displayError(container, "You must be logged in to view this profile.");
    return;
  }

  try {
    const profileData = await fetchProfileData(userName, token, apiKey);
    renderProfile(container, profileData);

    const listingsWrapper = createSectionWrapper(container, "userListings");
    await fetchAndRenderListings(userName, token, apiKey, listingsWrapper);
  } catch (error) {
    displayError(container, `Could not load profile: ${error.message}`);
  }
}

async function fetchProfileData(userName, token, apiKey) {
  const response = await fetch(
    `https://v2.api.noroff.dev/auction/profiles/${userName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch profile information.");
  }

  const { data } = await response.json();
  return data;
}

function renderProfile(container, data) {
  container.innerHTML = "";

  const bannerUrl = data.banner?.url || "https://via.placeholder.com/1200x300";
  const avatarUrl = data.avatar?.url || "https://via.placeholder.com/100";

  container.appendChild(
    createImageElement(
      bannerUrl,
      data.banner?.alt || "Banner",
      "w-full h-64 object-cover rounded-lg mb-4"
    )
  );
  container.appendChild(
    createImageElement(
      avatarUrl,
      data.avatar?.alt || "Avatar",
      "w-24 h-24 rounded-full mx-auto border-4 border-gray-700 -mt-16 bg-gray-900 object-cover"
    )
  );

  container.appendChild(
    createTextElement("h1", data.name, "text-2xl font-bold mt-4 text-center")
  );
  container.appendChild(
    createTextElement("p", data.email, "text-gray-400 text-center")
  );
  container.appendChild(
    createTextElement(
      "p",
      data.bio || "No bio available.",
      "text-gray-400 text-center"
    )
  );
}

async function fetchAndRenderListings(userName, token, apiKey, wrapper) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}/listings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch listings.");
    }

    const { data: listings } = await response.json();

    // Seksjonstittel
    const titleEl = createTextElement(
      "h2",
      "Listings",
      "text-xl font-bold text-center mb-4 col-span-full"
    );
    wrapper.appendChild(titleEl);

    if (listings.length === 0) {
      wrapper.appendChild(
        createTextElement(
          "p",
          "This user has no listings.",
          "text-gray-500 text-center col-span-full"
        )
      );
      return;
    }

    // Lag en grid-container for kortene
    const grid = document.createElement("div");
    grid.className =
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
    wrapper.appendChild(grid);

    listings.forEach((listing) => {
      const card = document.createElement("div");
      card.className = "bg-gray-800 p-4 rounded-lg shadow-md";

      card.appendChild(
        createTextElement(
          "h3",
          listing.title,
          "text-lg font-semibold text-white mb-2"
        )
      );

      const imageUrl =
        listing.media?.[0]?.url || "https://via.placeholder.com/400x300";
      card.appendChild(
        createImageElement(
          imageUrl,
          listing.title,
          "w-full h-40 object-cover rounded-lg mb-4"
        )
      );

      card.appendChild(
        createTextElement(
          "p",
          listing.description || "No description provided.",
          "text-gray-400 mb-4"
        )
      );

      const viewLink = document.createElement("a");
      viewLink.href = `/html/single-listing.html?id=${listing.id}`;
      viewLink.textContent = "View Listing";
      viewLink.className =
        "text-blue-500 hover:underline mt-2 inline-block font-medium";
      card.appendChild(viewLink);

      grid.appendChild(card);
    });
  } catch (error) {
    wrapper.appendChild(
      createTextElement(
        "p",
        `Error loading listings: ${error.message}`,
        "text-red-500 text-center col-span-full"
      )
    );
  }
}

// Utility: Image element
function createImageElement(src, alt, className) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = className;
  return img;
}

// Utility: Text element
function createTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

// Utility: Error message
function displayError(container, message) {
  container.innerHTML = "";
  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  errorMsg.className = "text-red-500 text-center";
  container.appendChild(errorMsg);
}

// Utility: Wrapper for sections
function createSectionWrapper(parent, id) {
  const wrapper = document.createElement("div");
  wrapper.id = id;

  wrapper.className = "mt-8 grid grid-cols-1 gap-6";
  parent.appendChild(wrapper);
  return wrapper;
}
