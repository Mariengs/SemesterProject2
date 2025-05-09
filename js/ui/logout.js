export function showLogoutButtonIfLoggedIn() {
  const token = localStorage.getItem("accessToken");

  if (!token) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.className =
    "text-gray-200 hover:bg-red-700 bg-black px-3 py-2 rounded-md";
  logoutBtn.id = "logout-btn";

  const navBar = document.querySelector(".md\\:flex.space-x-6");
  if (navBar) {
    navBar.appendChild(logoutBtn);
  }

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
