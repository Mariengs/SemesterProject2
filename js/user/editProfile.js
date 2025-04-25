import { API_KEY } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
});

const container = document.getElementById("profileContainer");
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");

if (!token || !userName || !API_KEY) {
  const errorMsg = document.createElement("p");
  errorMsg.textContent = "You must be logged in to edit your profile.";
  errorMsg.className = "text-red-500 text-center";
  container.appendChild(errorMsg);
} else {
  // Fetch profile data
  fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const { name, email, avatar, banner, bio } = data.data;

      container.innerHTML = "";

      const heading = document.createElement("h1");
      heading.textContent = "Edit Profile";
      heading.className = "text-2xl font-bold text-center mb-6";
      container.appendChild(heading);

      const formError = document.createElement("p");
      formError.id = "formError";
      formError.className = "text-red-500 text-sm hidden text-center mb-4";
      container.appendChild(formError);

      const form = document.createElement("form");
      form.className =
        "space-y-4 max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg";

      // Helper: input block
      const createInputBlock = (labelText, id, type, value = "") => {
        const div = document.createElement("div");

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.className = "block text-sm font-medium mb-1";
        label.textContent = labelText;
        div.appendChild(label);

        const input = document.createElement("input");
        input.setAttribute("type", type);
        input.setAttribute("id", id);
        input.setAttribute("name", id);
        input.className =
          "w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500";
        input.value = value;
        div.appendChild(input);

        return { div, input };
      };

      // Name
      const { div: nameDiv, input: nameField } = createInputBlock(
        "Username",
        "name",
        "text",
        name
      );
      nameField.setAttribute("readonly", true);
      nameField.classList.add("bg-gray-600", "cursor-not-allowed");
      form.appendChild(nameDiv);

      // Email (readonly, vises kun)
      const { div: emailDiv, input: emailField } = createInputBlock(
        "E-mail",
        "email",
        "email",
        email
      );
      emailField.setAttribute("readonly", true);
      emailField.classList.add("bg-gray-600", "cursor-not-allowed");
      form.appendChild(emailDiv);

      // Avatar
      const { div: avatarDiv, input: avatarField } = createInputBlock(
        "Avatar URL",
        "avatar-url",
        "url",
        avatar?.url || ""
      );
      form.appendChild(avatarDiv);

      // Banner
      const { div: bannerDiv, input: bannerField } = createInputBlock(
        "Banner URL",
        "banner-url",
        "url",
        banner?.url || ""
      );
      form.appendChild(bannerDiv);

      // Bio
      const bioDiv = document.createElement("div");
      const bioLabel = document.createElement("label");
      bioLabel.setAttribute("for", "bio");
      bioLabel.className = "block text-sm font-medium mb-1";
      bioLabel.textContent = "Bio";
      bioDiv.appendChild(bioLabel);

      const bioField = document.createElement("textarea");
      bioField.id = "bio";
      bioField.name = "bio";
      bioField.rows = 3;
      bioField.className =
        "w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500";
      bioField.textContent = bio || "";
      bioDiv.appendChild(bioField);
      form.appendChild(bioDiv);

      // Avatar preview
      const avatarPreview = document.createElement("img");
      avatarPreview.src = avatar?.url || "";
      avatarPreview.alt = "Avatar Preview";
      avatarPreview.className = "w-24 h-24 rounded-full object-cover mt-2";
      avatarDiv.appendChild(avatarPreview);

      // Banner preview
      const bannerPreview = document.createElement("img");
      bannerPreview.src = banner?.url || "";
      bannerPreview.alt = "Banner Preview";
      bannerPreview.className = "w-full h-32 object-cover mt-2";
      bannerDiv.appendChild(bannerPreview);

      // Live update preview on input change
      avatarField.addEventListener("input", () => {
        avatarPreview.src = avatarField.value;
      });

      bannerField.addEventListener("input", () => {
        bannerPreview.src = bannerField.value;
      });

      // Save button
      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "Save Changes";
      saveButton.className =
        "w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors";
      form.appendChild(saveButton);

      container.appendChild(form);

      // Form submit
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const updatedData = {
          name: nameField.value,
          avatar: {
            url: avatarField.value,
            alt: "User avatar",
          },
          banner: {
            url: bannerField.value,
            alt: "Profile banner",
          },
          bio: bioField.value,
        };

        fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.errors) {
              formError.textContent = data.errors[0].message;
              formError.classList.remove("hidden");
            } else {
              alert("Profile updated successfully!");
              window.location.href = "/html/profile.html";
            }
          })
          .catch((error) => {
            console.error("Error updating profile:", error);
            formError.textContent = "Something went wrong.";
            formError.classList.remove("hidden");
          });
      });
    })
    .catch((error) => {
      const errorMsg = document.createElement("p");
      errorMsg.textContent = "Could not fetch profile data.";
      errorMsg.className = "text-red-500 text-center";
      container.appendChild(errorMsg);
      console.error("Error fetching profile data:", error);
    });
}
