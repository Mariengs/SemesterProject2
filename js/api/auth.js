export const BASE_URL = "https://v2.api.noroff.dev/";
export const LOGIN_URL = "https://v2.api.noroff.dev/auth/login";
export const REGISTER_URL = "https://v2.api.noroff.dev/auth/register";

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}
