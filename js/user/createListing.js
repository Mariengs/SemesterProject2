import { API_KEY } from "../api/auth.js";
import { getAccessToken } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

// Globale variabler for annonser
let allListings = [];
let filteredListings = [];

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

      // Etter opprettelsen, oppdater allListings og vis den nye annonsen
      allListings.push(result.data); // Legger til den nye annonsen i listen
      applyFilters(); // Vis oppdaterte annonser
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

// Funksjon for å hente og vise brukerens egne annonser
function fetchUserListings() {
  const token = getAccessToken();
  const userName = localStorage.getItem("userName");

  if (!userName || !token) {
    return; // Hvis brukeren ikke er logget inn, hent ikke innlegg
  }

  fetch("https://v2.api.noroff.dev/auction/listings", {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const userListings = data.data.filter(
        (listing) => listing.author?.username === userName
      );

      if (userListings.length === 0) {
        message.textContent = "You have no listings yet.";
        message.classList.remove("text-green-500");
        message.classList.add("text-gray-500");
      } else {
        const listingsContainer = document.getElementById("listings-container");
        listingsContainer.innerHTML = ""; // Tøm eksisterende innhold

        userListings.forEach((listing) => {
          const listingCard = document.createElement("div");
          listingCard.className = "listing-card";

          const listingTitle = document.createElement("h3");
          listingTitle.textContent = listing.title;
          listingCard.appendChild(listingTitle);

          const listingDescription = document.createElement("p");
          listingDescription.textContent = listing.description;
          listingCard.appendChild(listingDescription);

          const listingLink = document.createElement("a");
          listingLink.textContent = "View Listing";
          listingLink.setAttribute(
            "href",
            `/html/single-listing.html?id=${listing.id}`
          );
          listingCard.appendChild(listingLink);

          listingsContainer.appendChild(listingCard);
        });
      }
    })
    .catch((error) => {
      message.textContent = `Failed to fetch listings: ${error.message}`;
      message.classList.add("text-red-500");
    });
}

// Funksjon for å filtrere og vise annonser
function applyFilters() {
  // For å filtrere og vise annonser, kan du bruke den eksisterende logikken i koden din:
  filteredListings = allListings; // Ikke filtrer for nå, eller legg til ønsket filter

  // Vis annonser basert på filtrering
  displayListings();
}

// Funksjon for å vise annonser
function displayListings() {
  const listingsContainer = document.getElementById("listings-container");
  listingsContainer.innerHTML = ""; // Tøm eksisterende innhold

  filteredListings.forEach((listing) => {
    const listingCard = document.createElement("div");
    listingCard.className = "listing-card";

    const listingTitle = document.createElement("h3");
    listingTitle.textContent = listing.title;
    listingCard.appendChild(listingTitle);

    const listingDescription = document.createElement("p");
    listingDescription.textContent = listing.description;
    listingCard.appendChild(listingDescription);

    const listingLink = document.createElement("a");
    listingLink.textContent = "View Listing";
    listingLink.setAttribute(
      "href",
      `/html/single-listing.html?id=${listing.id}`
    );
    listingCard.appendChild(listingLink);

    listingsContainer.appendChild(listingCard);
  });
}
