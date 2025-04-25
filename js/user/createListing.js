import { API_KEY } from "../api/auth.js";
import { getAccessToken } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
});

const form = document.getElementById("create-listing-form");
const message = document.getElementById("form-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = getAccessToken();
  if (!token) {
    message.textContent = "You must be logged in to create a listing.";
    message.classList.add("text-red-500");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const mediaRaw = document.getElementById("media").value.trim();
  let endsAt = document.getElementById("endsAt").value;

  // Konverter endsAt til ISO 8601-format
  endsAt = new Date(endsAt).toISOString();

  const media = mediaRaw
    ? mediaRaw.split(",").map((url) => ({ url: url.trim(), alt: "" }))
    : [];

  const listingData = {
    title,
    description,
    media,
    endsAt,
  };

  // Logg dataene som sendes
  console.log("Listing data being sent:", listingData);

  try {
    const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(listingData),
    });

    const result = await response.json();

    // Logg API-responsen for å se eventuelle feilmeldinger
    console.log("API Response:", result);

    if (response.ok) {
      message.textContent = "Listing created successfully!";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");
      form.reset();
    } else {
      throw new Error(
        result.errors?.[0]?.message || "Failed to create listing."
      );
    }
  } catch (error) {
    message.textContent = error.message;
    message.classList.remove("text-green-500");
    message.classList.add("text-red-500");
  }
});
