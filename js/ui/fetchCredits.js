import { getAccessToken, API_KEY } from "../api/auth.js";

export async function fetchAndDisplayCredits() {
  const token = getAccessToken();
  const userName = localStorage.getItem("userName");

  const creditContainer = document.getElementById("creditInfo");

  // Skjul hvis ikke logget inn
  if (!token || !userName) {
    if (creditContainer) {
      creditContainer.style.display = "none";
    }
    return;
  }

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
      }
    );

    const result = await response.json();
    const credits = result.data.credits;

    if (creditContainer) {
      creditContainer.style.display = "inline-block"; // Vis igjen hvis skjult
      creditContainer.textContent = `Credits: ${credits} kr`;
    }
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    if (creditContainer) {
      creditContainer.style.display = "none";
    }
  }
}
