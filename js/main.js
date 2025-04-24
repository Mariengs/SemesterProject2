import { toggleMenu } from "./ui/navbar.js";
import { updateNavbarForUser } from "./ui/navbar.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
});

document.addEventListener("DOMContentLoaded", () => {
  updateNavbarForUser();
});
