import { API_KEY } from "../api/auth.js";
import { getAccessToken } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

// DOM-elementer
const form = document.getElementById("create-listing-form");
const message = document.getElementById("form-message");
const listingsContainer = document.getElementById("listings-container");

// Initier app
document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
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
  const mediaRaw = document.getElementById("media").value.trim();
  let endsAt = document.getElementById("endsAt").value;

  endsAt = new Date(endsAt).toISOString();

  const media = mediaRaw
    ? mediaRaw.split(",").map((url) => ({ url: url.trim(), alt: "" }))
    : [];

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
    console.log("API Response:", result);

    if (response.ok) {
      displayMessage("Listing created successfully! Redirecting...", "green");
      setTimeout(() => {
        // Send hendelse etter oppretting av annonse
        const event = new CustomEvent("listingCreated", {
          detail: { message: "New listing created!" },
        });
        window.dispatchEvent(event); // Send hendelsen til window

        // Omdiriger til index.html etter 1,5 sek
        window.location.href = "/html/profile.html";
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
  } else if (type === "gray") {
    message.classList.add("text-gray-500");
  }
}
