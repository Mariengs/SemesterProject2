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

  const token = localStorage.getItem("accessToken");
  const authMessage = document.getElementById("auth-message");
  const profileContainer = document.getElementById("profiles-container");

  if (!token) {
    if (authMessage) {
      authMessage.classList.remove("hidden");
    }
    if (profileContainer) {
      profileContainer.classList.add("hidden");
    }
    return;
  }

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

// Create the search input
function createSearchField() {
  const wrapper = document.getElementById("profiles-wrapper");
  if (!wrapper) return;

  const container = document.createElement("div");
  container.className = "mb-6 max-w-md mx-auto relative";

  // 🔍 Search icon
  const icon = document.createElement("span");
  icon.textContent = "🔍";
  icon.className = "absolute left-3 top-3 text-gray-400 pointer-events-none";

  // ❌ Clear button
  const clearBtn = document.createElement("button");
  clearBtn.textContent = "✖️";
  clearBtn.className =
    "absolute right-3 top-2.5 text-gray-400 hover:text-white hidden";
  clearBtn.setAttribute("type", "button");

  // Input field
  const inputField = document.createElement("input");
  inputField.setAttribute("type", "text");
  inputField.setAttribute("id", "search-input");
  inputField.setAttribute("placeholder", "Search by username...");
  inputField.className =
    "p-3 pl-10 pr-10 w-full rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150";

  // Clear on click
  clearBtn.addEventListener("click", () => {
    inputField.value = "";
    clearBtn.classList.add("hidden");
    fetchProfiles(); // reset list
  });

  // Show/hide clear button dynamically
  inputField.addEventListener("input", () => {
    if (inputField.value.trim().length > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
  });

  container.appendChild(icon);
  container.appendChild(clearBtn);
  container.appendChild(inputField);
  wrapper.insertBefore(container, wrapper.firstChild);
}

// Create the container for profiles
function createProfilesContainer() {
  const container = document.getElementById("profiles-container");
  container.classList.add(
    "grid",
    "grid-cols-1",
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    "gap-6",
    "p-4"
  );
}

async function fetchProfiles(query = "") {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Token not found. Please log in.");
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
    throw new Error("No profiles found");
  }

  displayProfiles(data.data);
}

function displayProfiles(profiles) {
  const container = document.getElementById("profiles-container");
  container.innerHTML = "";

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
    bio.textContent = profile.bio || "No bio available";

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
      window.location.href = `/html/different-profile.html?name=${profile.name}`;
    });

    profileDiv.appendChild(avatar);
    profileDiv.appendChild(name);
    profileDiv.appendChild(bio);
    profileDiv.appendChild(profileButton);

    container.appendChild(profileDiv);
  });
}
