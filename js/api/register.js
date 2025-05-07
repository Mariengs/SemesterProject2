import { REGISTER_URL } from "./auth.js";
import { toggleMenu } from "../ui/navbar.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
});

function showErrorMessage(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

function hideErrorMessages() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.add("hidden");
    el.textContent = "";
  });
}

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function getValues() {
  hideErrorMessages();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const bio = document.getElementById("bio")?.value.trim() || null;
  const avatar = document.getElementById("avatar")?.value.trim() || null;
  const banner = document.getElementById("banner")?.value.trim() || null;

  let isValid = true;

  // Name validation
  if (!name) {
    showErrorMessage("nameError", "Username is required.");
    isValid = false;
  } else if (/[^a-zA-Z0-9_]/.test(name)) {
    showErrorMessage(
      "nameError",
      "Username can only contain letters, numbers, and underscores."
    );
    isValid = false;
  }

  // Email validation
  if (!email) {
    showErrorMessage("emailError", "Email is required.");
    isValid = false;
  } else if (!email.endsWith("@stud.noroff.no")) {
    showErrorMessage("emailError", "Email must end with @stud.noroff.no.");
    isValid = false;
  }

  // Password validation
  if (!password) {
    showErrorMessage("passwordError", "Password is required.");
    isValid = false;
  } else if (password.length < 8) {
    showErrorMessage(
      "passwordError",
      "Password must be at least 8 characters."
    );
    isValid = false;
  }

  // Bio validation
  if (bio && bio.length > 160) {
    showErrorMessage("bioError", "Bio must be less than 160 characters.");
    isValid = false;
  }

  // Avatar validation
  if (avatar && !isValidURL(avatar)) {
    showErrorMessage("avatarError", "Avatar must be a valid URL.");
    isValid = false;
  }

  // Banner validation
  if (banner && !isValidURL(banner)) {
    showErrorMessage("bannerError", "Banner must be a valid URL.");
    isValid = false;
  }

  return isValid ? { name, password, email, bio, avatar, banner } : null;
}

function createRequestBody({ name, email, password, bio, avatar, banner }) {
  return {
    name,
    email,
    password,
    bio: bio ?? "Default bio",
    avatar: {
      url: avatar || "https://via.placeholder.com/150",
      alt: "User avatar",
    },
    banner: {
      url: banner || "https://via.placeholder.com/600x200",
      alt: "User banner",
    },
    venueManager: true,
  };
}

async function registerUser(requestBody) {
  try {
    const response = await fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Something went wrong:", errorData);
      showErrorMessage(
        "formError",
        `Registration failed: ${errorData.message || response.statusText}`
      );
      return;
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    alert("Registration successful!");
    window.location.href = "login.html";
  } catch (error) {
    showErrorMessage("formError", `Something went wrong: ${error.message}`);
  }
}

document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const values = getValues();
    if (!values) {
      return;
    }

    const requestBodyData = createRequestBody(values);
    registerUser(requestBodyData);
  });
