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
});

async function fetchProfiles() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Token ikke funnet. Vennligst logg inn.");
  }

  const response = await fetch("https://v2.api.noroff.dev/auction/profiles", {
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

  return data.data;
}

// Funksjon for å vise profiler på siden
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

// Initialiser funksjonen for å hente profiler og vise dem
fetchProfiles()
  .then((profiles) => displayProfiles(profiles))
  .catch((error) => {
    console.error("Error fetching profiles:", error);
  });
