import { REGISTER_URL } from "../api/auth.js";

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

function getValues() {
  hideErrorMessages();

  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value.trim();
  const email = document.getElementById("email").value.trim();
  const bio = document.getElementById("bio")?.value.trim() || null;
  const avatarUrl = document.getElementById("avatar")?.value.trim() || null;

  let isValid = true;

  if (!name || !password || !email) {
    showErrorMessage("formError", "All fields are required.");
    isValid = false;
  }

  if (!email.endsWith("@stud.noroff.no")) {
    showErrorMessage("emailError", "E-mail must end with @stud.noroff.no");
    isValid = false;
  }

  if (password.length < 8) {
    showErrorMessage(
      "passwordError",
      "Password must be at least 8 characters."
    );
    isValid = false;
  }

  return isValid ? { name, password, email, bio, avatarUrl } : null;
}

function createRequestBody({ name, email, password, bio, avatarUrl }) {
  return {
    name,
    email,
    password,
    bio: bio ?? "Default bio",
    avatar: avatarUrl
      ? { url: avatarUrl, alt: "User avatar" }
      : { url: "placeholder.png", alt: "Default avatar" },
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
  .getElementById("registerform")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const values = getValues();
    if (!values) {
      return;
    }

    const requestBodyData = createRequestBody(values);
    registerUser(requestBodyData);
  });
