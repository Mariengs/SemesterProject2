export function toggleMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

export function updateNavbarForUser() {
  const token = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName"); // hvis du lagrer dette etter login

  const desktopLinks = document.querySelectorAll("nav .md\\:flex a");
  const mobileLinks = document.querySelectorAll("#mobile-menu a");

  if (token && userName) {
    // Bytt ut "Login" i desktop-nav
    desktopLinks.forEach((link) => {
      if (link.textContent.trim() === "Login") {
        link.textContent = "Profile";
        link.setAttribute("href", `/html/profile.html?name=${userName}`);
      }
    });

    // Bytt ut "Login" i mobil-nav
    mobileLinks.forEach((link) => {
      if (link.textContent.trim() === "Login") {
        link.textContent = "Profile";
        link.setAttribute("href", `/html/profile.html?name=${userName}`);
      }
    });
  }
}
