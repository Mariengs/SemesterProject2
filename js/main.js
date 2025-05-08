import { toggleMenu, updateNavbarForUser } from "./ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "./ui/logout.js";
import { updateNavVisibility } from "./ui/authHelpers.js";

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  updateNavVisibility();
});
