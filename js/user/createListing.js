import { API_KEY } from "../api/auth.js";
import { getAccessToken } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";

const form = document.getElementById("create-listing-form");
const message = document.getElementById("form-message");
const listingsContainer = document.getElementById("listings-container");
const mediaWrapper = document.getElementById("media-wrapper");
const addImageButton = document.getElementById("add-image-button");

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  fetchAndDisplayCredits();
  addImageButton?.click();
});

addImageButton?.addEventListener("click", () => {
  const container = document.createElement("div");
  container.className = "mt-4 space-y-2 border border-gray-700 p-4 rounded";

  const inputRow = document.createElement("div");
  inputRow.className = "flex items-center gap-2 w-full";

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.placeholder = "Image URL";
  urlInput.className =
    "flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600";
  urlInput.required = false;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "✕";
  removeBtn.className =
    "text-white bg-red-600 rounded px-2 py-1 hover:bg-red-700 text-sm";
  removeBtn.addEventListener("click", () => {
    container.remove();
  });

  const preview = document.createElement("img");
  preview.className =
    "h-24 w-24 object-cover rounded border border-gray-600 hidden mt-2";
  preview.alt = "Preview";

  const errorText = document.createElement("p");
  errorText.className = "text-red-500 text-sm hidden";
  errorText.textContent = "Image could not be loaded.";

  inputRow.appendChild(urlInput);
  inputRow.appendChild(removeBtn);
  container.appendChild(inputRow);
  container.appendChild(preview);
  container.appendChild(errorText);
  mediaWrapper.appendChild(container);

  urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    if (isValidImageUrl(url)) {
      preview.src = url;
      preview.onload = () => {
        preview.classList.remove("hidden");
        errorText.classList.add("hidden");
      };
      preview.onerror = () => {
        preview.classList.add("hidden");
        errorText.classList.remove("hidden");
      };
    } else {
      preview.classList.add("hidden");
      errorText.classList.add("hidden");
    }
  });
});

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

  const mediaContainers = mediaWrapper.querySelectorAll("div");
  const media = Array.from(mediaContainers)
    .map((container) => {
      const url = container.querySelector("input")?.value.trim();
      if (url) {
        return { url, alt: "Listing image" };
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

function isValidImageUrl(url) {
  return /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}
