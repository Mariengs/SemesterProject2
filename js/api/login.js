import { LOGIN_URL } from "../api/auth.js";

async function logIn(email, password) {
  try {
    const response = await fetch(`${LOGIN_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    if (data.accessToken) {
      localStorage.setItem("user", JSON.stringify({ username: data.username }));
      localStorage.setItem("accessToken", data.accessToken);

      alert("Login successful!");
      window.location.href = "/";
    } else if (data.data && data.data.accessToken) {
      localStorage.setItem(
        "user",
        JSON.stringify({ username: data.data.name })
      );
      localStorage.setItem("accessToken", data.data.accessToken);

      alert("Login successful!");
      window.location.href = "/";
    } else {
      throw new Error("No access token received");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Could not log in. Please try again.");
  }
}

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    logIn(email, password);
  });
