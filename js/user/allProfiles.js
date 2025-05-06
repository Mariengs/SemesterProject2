import { API_KEY } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();

  createSearchField();
  createProfilesContainer();

  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();
    fetchProfiles(query);
  });

  // Initial fetch for profiles without any search query
  fetchProfiles();
});

// Dynamisk opprette søkefeltet
function createSearchField() {
  const searchContainer = document.createElement("div");
  searchContainer.classList.add("p-4");

  const inputField = document.createElement("input");
  inputField.setAttribute("type", "text");
  inputField.setAttribute("id", "search-input");
  inputField.setAttribute("placeholder", "Search by username...");
  inputField.classList.add(
    "p-2",
    "w-full",
    "border",
    "border-gray-300",
    "rounded-md",
    "text-gray-900"
  );

  searchContainer.appendChild(inputField);
  document.body.insertBefore(
    searchContainer,
    document.getElementById("profiles-container")
  );
}

// Dynamisk opprette container for profiler
function createProfilesContainer() {
  const container = document.createElement("div");
  container.setAttribute("id", "profiles-container");
  container.classList.add(
    "grid",
    "grid-cols-1",
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    "gap-6",
    "p-4"
  );

  document.body.appendChild(container);
}

async function fetchProfiles(query = "") {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Token ikke funnet. Vennligst logg inn.");
  }

  let url = "https://v2.api.noroff.dev/auction/profiles";
  if (query) {
    url = `https://v2.api.noroff.dev/auction/profiles/search?q=${query}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  if (!data || !data.data) {
    throw new Error("Ingen profiler funnet");
  }

  displayProfiles(data.data); // Vis profiler basert på resultatene
}

function displayProfiles(profiles) {
  const container = document.getElementById("profiles-container");
  container.innerHTML = ""; // Tømmer containeren før ny data vises

  profiles.forEach((profile) => {
    const profileDiv = document.createElement("div");
    profileDiv.classList.add(
      "bg-gray-800",
      "p-6",
      "rounded-lg",
      "shadow-md",
      "hover:shadow-xl",
      "transition",
      "duration-300",
      "ease-in-out",
      "cursor-pointer"
    );

    const avatar = document.createElement("img");
    avatar.src = profile.avatar?.url || "default-avatar.jpg";
    avatar.alt = profile.avatar?.alt || "Avatar";
    avatar.classList.add(
      "w-24",
      "h-24",
      "rounded-full",
      "mb-4",
      "object-cover"
    );

    const name = document.createElement("h2");
    name.classList.add("text-xl", "font-semibold", "text-white", "mb-2");
    name.textContent = profile.name;

    const bio = document.createElement("p");
    bio.classList.add("text-gray-400", "mb-4");
    bio.textContent = profile.bio || "Ingen bio tilgjengelig";

    const profileButton = document.createElement("button");
    profileButton.textContent = "View Profile";
    profileButton.classList.add(
      "bg-blue-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "mt-4",
      "w-full"
    );
    profileButton.addEventListener("click", () => {
      window.location.href = `/html/profile.html?name=${profile.name}`;
    });

    profileDiv.appendChild(avatar);
    profileDiv.appendChild(name);
    profileDiv.appendChild(bio);
    profileDiv.appendChild(profileButton);

    container.appendChild(profileDiv);
  });
}
