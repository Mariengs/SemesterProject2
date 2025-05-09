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
const mediaWrapper = document.getElementById("media-wrapper");
const addImageButton = document.getElementById("add-image-button");

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  fetchAndDisplayCredits();
});

addImageButton?.addEventListener("click", () => {
  const container = document.createElement("div");
  container.className = "mt-4 space-y-2 border border-gray-700 p-4 rounded";
  container.classList.add("media-item");

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

  inputRow.append(urlInput, removeBtn);

  const preview = document.createElement("img");
  preview.className =
    "w-24 h-24 object-cover rounded border border-gray-600 hidden mt-2";
  preview.alt = "Preview";
  const errorText = document.createElement("p");
  errorText.className = "text-red-500 text-sm hidden";
  errorText.textContent = "Could not load image.";

  container.append(inputRow, preview, errorText);
  mediaWrapper.appendChild(container);

  function loadPreview(url) {
    if (!url) {
      preview.classList.add("hidden");
      errorText.classList.add("hidden");
      preview.removeAttribute("src");
      return;
    }
    preview.src = url;

    preview.classList.add("hidden");
  }

  urlInput.addEventListener("input", () => {
    loadPreview(urlInput.value.trim());
  });
  urlInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const trimmed = pasted.trim();
    urlInput.value = trimmed;
    loadPreview(trimmed);
  });

  preview.onload = () => {
    preview.classList.remove("hidden");
    errorText.classList.add("hidden");
  };
  preview.onerror = () => {
    preview.classList.add("hidden");
    errorText.classList.remove("hidden");
  };
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

  const mediaContainers = Array.from(mediaWrapper.children).filter((el) =>
    el.classList.contains("media-item")
  );

  const media = Array.from(mediaContainers)
    .map((container) => {
      const url = container.querySelector("input[type='url']")?.value.trim();
      return url ? { url, alt: "Listing image" } : null;
    })
    .filter(Boolean);

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
