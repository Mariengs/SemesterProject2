import { toggleMenu } from "../ui/navbar.js";
import { updateNavVisibility } from "../ui/authHelpers.js";
import { showErrorMessage, hideErrorMessages } from "../helpers/ui.js";
import {
  isValidURL,
  isValidUsername,
  isValidStudEmail,
  isValidPassword,
  isValidBio,
} from "../helpers/validation.js";
import {
  createRegisterRequestBody,
  registerUser,
} from "../helpers/registerHelpers.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
  updateNavVisibility();
});

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
  } else if (!isValidUsername(name)) {
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
  } else if (!isValidStudEmail(email)) {
    showErrorMessage("emailError", "Email must end with @stud.noroff.no.");
    isValid = false;
  }

  // Password validation
  if (!password) {
    showErrorMessage("passwordError", "Password is required.");
    isValid = false;
  } else if (!isValidPassword(password)) {
    showErrorMessage(
      "passwordError",
      "Password must be at least 8 characters."
    );
    isValid = false;
  }

  // Bio validation
  if (!isValidBio(bio)) {
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

async function handleRegistration(requestBody) {
  try {
    const data = await registerUser(requestBody);
    localStorage.setItem("accessToken", data.accessToken);
    alert("Registration successful!");
    window.location.href = "login.html";
  } catch (error) {
    showErrorMessage("formError", `Registration failed: ${error.message}`);
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

    const requestBodyData = createRegisterRequestBody(values);
    handleRegistration(requestBodyData);
  });
