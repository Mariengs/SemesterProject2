import { toggleMenu, updateNavbarForUser } from "./ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "./ui/logout.js";
import { fetchListings } from "./listings/fetchListings.js";

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
});

window.addEventListener("listingCreated", () => {
  fetchListings(); // Hent de nyeste oppdaterte innleggene etter at en annonse er lagt til
});
