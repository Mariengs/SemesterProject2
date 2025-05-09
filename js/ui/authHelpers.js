import { getAccessToken } from "../api/auth.js";

export function updateNavVisibility() {
  const token = getAccessToken();
  const username = localStorage.getItem("userName");
  const isLoggedIn = token && username;

  const allProfilesLink = document.getElementById("nav-all-profiles");
  const profileLink = document.getElementById("nav-profile");
  const mobileAllProfile = document.getElementById("mobile-all-profiles");
  const mobileProfile = document.getElementById("mobile-profile");

  function toggle(el) {
    if (el) el.style.display = isLoggedIn ? "inline-block" : "none";
  }

  toggle(allProfilesLink);
  toggle(profileLink);
  toggle(mobileAllProfile);
  toggle(mobileProfile);
}
