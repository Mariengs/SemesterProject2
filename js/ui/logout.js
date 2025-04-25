export function showLogoutButtonIfLoggedIn() {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  // Lag logg ut-knappen
  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.className =
    "text-gray-200 hover:bg-red-700 bg-red-600 px-3 py-2 rounded-md";
  logoutBtn.id = "logout-btn";

  // Desktop-meny: finn containeren der de andre linkene er
  const navBar = document.querySelector(".md\\:flex.space-x-6");
  if (navBar) {
    navBar.appendChild(logoutBtn);
  }

  // Mobilmeny: finn mobilmeny-elementet og legg til knappen
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    const mobileLogoutBtn = logoutBtn.cloneNode(true);
    mobileLogoutBtn.classList.add("block", "w-full");
    mobileMenu.appendChild(mobileLogoutBtn);
  }
}

export function setupLogoutFunctionality() {
  document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "logout-btn") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  });
}
