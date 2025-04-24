import { toggleMenu } from "../ui/navbar.js";
import { LOGIN_URL, API_KEY } from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
});

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email.endsWith("@stud.noroff.no")) {
    alert("You must have @stud.noroff.no e-mail address to log in.");
    return;
  }

  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      const { accessToken, name, credits } = result.data;

      // Lagre data i localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userName", name);
      localStorage.setItem("credits", credits);

      localStorage.setItem("apiKey", API_KEY);

      alert(`Welcome, ${name}!`);
      window.location.href = "/";
    } else {
      alert(result.errors?.[0]?.message || "Login failed.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Something went wrong.");
  }
});
