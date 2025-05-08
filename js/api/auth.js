export const BASE_URL = "https://v2.api.noroff.dev/";
export const LOGIN_URL = "https://v2.api.noroff.dev/auth/login";
export const REGISTER_URL = "https://v2.api.noroff.dev/auth/register";
export const API_KEY = "189c7714-8a1c-4a77-963f-6b89d86e85a9";

export function getAccessToken() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.error("No access token found.");
    return null;
  }

  return token;
}

export async function login(username, password) {
  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/";
}
