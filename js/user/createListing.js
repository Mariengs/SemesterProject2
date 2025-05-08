import { API_KEY } from "../api/auth.js";
import { getAccessToken } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";

// DOM-elementer
const form = document.getElementById("create-listing-form");
const message = document.getElementById("form-message");
const listingsContainer = document.getElementById("listings-container");
const mediaWrapper = document.getElementById("media-wrapper");
const addImageButton = document.getElementById("add-image-button");

// Initier app
document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  fetchAndDisplayCredits();

  // Legg til ett bildefelt ved første last
  addImageButton?.click();
});

// Legg til nytt bilde-felt
addImageButton?.addEventListener("click", () => {
  const container = document.createElement("div");
  container.className = "mt-2";

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.placeholder = "Image URL";
  urlInput.className =
    "w-full p-2 mb-1 rounded bg-gray-800 text-white border border-gray-600";
  urlInput.required = false;

  container.appendChild(urlInput);

  mediaWrapper.appendChild(container);
});

// Opprett ny annonse
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = getAccessToken();
  if (!token) {
    displayMessage("You must be logged in to create a listing.", "red");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  let endsAt = document.getElementById("endsAt").value;

  endsAt = new Date(endsAt).toISOString();

  // Hent alle bilde-URL-er
  const mediaContainers = mediaWrapper.querySelectorAll("div");
  const media = Array.from(mediaContainers)
    .map((container) => {
      const inputs = container.querySelectorAll("input");
      const url = inputs[0]?.value.trim();
      const alt = inputs[1]?.value.trim() || "";
      if (url) {
        return { url, alt };
      }
      return null;
    })
    .filter((item) => item !== null);

  const listingData = { title, description, media, endsAt };

  try {
    const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(listingData),
    });

    const result = await response.json();

    if (response.ok) {
      displayMessage("Listing created successfully! Redirecting...", "green");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("listingCreated"));
        window.location.href = "/";
      }, 1000);
    } else {
      throw new Error(
        result.errors?.[0]?.message || "Failed to create listing"
      );
    }
  } catch (error) {
    displayMessage(error.message, "red");
  }
});

// Vis meldinger til brukeren
function displayMessage(text, type) {
  message.textContent = text;
  message.className = "";
  if (type === "red") {
    message.classList.add("text-red-500");
  } else if (type === "green") {
    message.classList.add("text-green-500");
  } else {
    message.classList.add("text-gray-500");
  }
}
