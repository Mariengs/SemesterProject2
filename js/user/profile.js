import { toggleMenu } from "../ui/navbar.js";
import { updateNavbarForUser } from "../ui/navbar.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
});
updateNavbarForUser();
import { API_KEY } from "../api/auth.js";

const container = document.getElementById("profileContainer");
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const apiKey = API_KEY;

if (!token || !userName || !apiKey) {
  const errorMsg = document.createElement("p");
  errorMsg.textContent = "Du må være logget inn for å se denne siden.";
  errorMsg.className = "text-red-500";
  container.appendChild(errorMsg);
} else {
  fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": apiKey,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const { name, email, avatar, banner, credits, bio } = data.data;

      // Tøm containeren
      container.innerHTML = "";

      // Banner

      const bannerUrl = banner?.url || "https://via.placeholder.com/800x200"; // Fallback URL
      const bannerImg = document.createElement("img");
      bannerImg.setAttribute("src", bannerUrl);
      bannerImg.setAttribute("alt", banner?.alt || "Banner");
      bannerImg.className = "w-full h-48 object-cover rounded-lg mb-4";
      container.appendChild(bannerImg);

      // Avatar
      const avatarUrl = avatar?.url || "https://via.placeholder.com/100"; // Fallback URL
      const avatarImg = document.createElement("img");
      avatarImg.setAttribute("src", avatarUrl);
      avatarImg.setAttribute("alt", avatar?.alt || "Avatar");
      avatarImg.className =
        "w-24 h-24 rounded-full mx-auto border-4 border-gray-700 -mt-16 bg-gray-900 object-cover";
      container.appendChild(avatarImg);

      // Navn
      const nameHeading = document.createElement("h1");
      nameHeading.textContent = name;
      nameHeading.className = "text-2xl font-bold mt-4 text-center";
      container.appendChild(nameHeading);

      // E-post
      const emailPara = document.createElement("p");
      emailPara.textContent = email;
      emailPara.className = "text-gray-400 text-center";
      container.appendChild(emailPara);

      // Bio
      const bioPara = document.createElement("p");
      bioPara.textContent = bio || "No bio available.";
      bioPara.className = "text-gray-400 text-center";
      container.appendChild(bioPara);

      // Kreditt
      const creditPara = document.createElement("p");
      creditPara.textContent = `Credits: ${credits}`;
      creditPara.className =
        "text-lg font-semibold text-green-400 text-center mt-2";
      container.appendChild(creditPara);
      // Edit Profile Button
      const editProfileButton = document.createElement("button");
      editProfileButton.textContent = "Edit Profile";
      editProfileButton.className =
        "mt-4 px-4 py-2 bg-blue-500 text-white rounded";
      editProfileButton.addEventListener("click", () => {
        window.location.href = "/html/edit-profile.html"; // Redirect to edit profile page
      });
      container.appendChild(editProfileButton);
    })
    .catch((error) => {
      const errorMsg = document.createElement("p");
      errorMsg.textContent = `Could not load profile: ${error.message}`;
      errorMsg.className = "text-red-500";
      container.appendChild(errorMsg);
    });
}
