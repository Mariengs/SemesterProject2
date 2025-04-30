import { API_KEY } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
});
updateNavbarForUser();

const container = document.getElementById("profileContainer");
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const apiKey = API_KEY;

if (!token || !userName || !apiKey) {
  const errorMsg = document.createElement("p");
  errorMsg.textContent = "You must be logged in to view your profile.";
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

      container.innerHTML = "";

      const bannerUrl = banner?.url || "https://via.placeholder.com/800x200";
      const bannerImg = document.createElement("img");
      bannerImg.setAttribute("src", bannerUrl);
      bannerImg.setAttribute("alt", banner?.alt || "Banner");
      bannerImg.className = "w-full h-48 object-cover rounded-lg mb-4";
      container.appendChild(bannerImg);

      const avatarUrl = avatar?.url || "https://via.placeholder.com/100";
      const avatarImg = document.createElement("img");
      avatarImg.setAttribute("src", avatarUrl);
      avatarImg.setAttribute("alt", avatar?.alt || "Avatar");
      avatarImg.className =
        "w-24 h-24 rounded-full mx-auto border-4 border-gray-700 -mt-16 bg-gray-900 object-cover";
      container.appendChild(avatarImg);

      const nameHeading = document.createElement("h1");
      nameHeading.textContent = name;
      nameHeading.className = "text-2xl font-bold mt-4 text-center";
      container.appendChild(nameHeading);

      const emailPara = document.createElement("p");
      emailPara.textContent = email;
      emailPara.className = "text-gray-400 text-center";
      container.appendChild(emailPara);

      const bioPara = document.createElement("p");
      bioPara.textContent = bio || "No bio available.";
      bioPara.className = "text-gray-400 text-center";
      container.appendChild(bioPara);

      const creditPara = document.createElement("p");
      creditPara.textContent = `Credits: ${credits}`;
      creditPara.className =
        "text-lg font-semibold text-green-400 text-center mt-2";
      container.appendChild(creditPara);

      const editProfileButton = document.createElement("button");
      editProfileButton.textContent = "Edit Profile";
      editProfileButton.className =
        "mt-4 px-4 py-2 bg-blue-500 text-white rounded";
      editProfileButton.addEventListener("click", () => {
        window.location.href = "/html/edit-profile.html";
      });
      container.appendChild(editProfileButton);

      // Wrapper for listings
      const myListingsWrapper = document.createElement("div");
      myListingsWrapper.id = "myListingsWrapper";
      container.appendChild(myListingsWrapper);

      // Wrapper for bids
      const myBidsWrapper = document.createElement("div");
      myBidsWrapper.id = "myBidsWrapper";
      container.appendChild(myBidsWrapper);

      fetchListings(userName, myListingsWrapper);
      fetchBids(userName, myBidsWrapper);
    })
    .catch((error) => {
      const errorMsg = document.createElement("p");
      errorMsg.textContent = `Could not load profile: ${error.message}`;
      errorMsg.className = "text-red-500";
      container.appendChild(errorMsg);
    });
}

function fetchListings(userName, wrapper) {
  fetch(`https://v2.api.noroff.dev/auction/profiles/${userName}/listings`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": apiKey,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const listings = data.data;

      const title = document.createElement("h2");
      title.textContent = "My listings";
      title.className = "text-xl font-bold mt-8 text-center";
      wrapper.appendChild(title);

      if (listings.length === 0) {
        const noListingsMsg = document.createElement("p");
        noListingsMsg.textContent = "You have no listings yet.";
        noListingsMsg.className = "text-gray-500 text-center";
        wrapper.appendChild(noListingsMsg);
        return;
      }

      listings.forEach((listing) => {
        const card = document.createElement("div");
        card.className = "bg-gray-800 p-4 rounded-lg shadow-md mb-6";

        const title = document.createElement("h3");
        title.textContent = listing.title;
        title.className = "text-lg font-semibold text-white";
        card.appendChild(title);

        const imageUrl =
          listing.media && listing.media.length > 0 ? listing.media[0].url : "";
        const image = document.createElement("img");
        image.setAttribute("src", imageUrl);
        image.className = "w-full h-48 object-cover rounded-lg mb-4";
        card.appendChild(image);

        const description = document.createElement("p");
        description.textContent =
          listing.description || "No description available.";
        description.className = "text-gray-400";
        card.appendChild(description);

        const viewButton = document.createElement("a");
        viewButton.textContent = "View Listing";
        viewButton.href = `/html/single-listing.html?id=${listing.id}`;
        viewButton.className =
          "text-blue-500 hover:underline mt-4 inline-block";
        card.appendChild(viewButton);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className =
          "ml-4 text-yellow-500 hover:underline inline-block";
        editButton.addEventListener("click", () => {
          showEditForm(listing, card);
        });
        card.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className =
          "ml-4 text-red-500 hover:underline inline-block";
        deleteButton.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this listing?")) {
            fetch(`https://v2.api.noroff.dev/auction/listings/${listing.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Noroff-API-Key": apiKey,
              },
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error("Failed to delete listing");
                }
                card.remove();
              })
              .catch((err) => alert("Error deleting listing: " + err.message));
          }
        });
        card.appendChild(deleteButton);

        wrapper.appendChild(card);
      });
    })
    .catch((error) => {
      const errorMsg = document.createElement("p");
      errorMsg.textContent = `Could not load listings: ${error.message}`;
      errorMsg.className = "text-red-500";
      wrapper.appendChild(errorMsg);
    });
}

function showEditForm(listing, card) {
  // Fjern eventuell eksisterende form først
  const existingForm = card.querySelector("form");
  if (existingForm) {
    existingForm.remove();
  }

  const form = document.createElement("form");
  form.className =
    "space-y-4 mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  titleLabel.className = "block text-white";
  form.appendChild(titleLabel);

  const titleInput = document.createElement("input");
  titleInput.value = listing.title;
  titleInput.className = "w-full p-2 rounded bg-gray-700 text-white";
  form.appendChild(titleInput);

  const descLabel = document.createElement("label");
  descLabel.textContent = "Description";
  descLabel.className = "block text-white";
  form.appendChild(descLabel);

  const descInput = document.createElement("textarea");
  descInput.value = listing.description || "";
  descInput.className = "w-full p-2 rounded bg-gray-700 text-white";
  form.appendChild(descInput);

  const imageLabel = document.createElement("label");
  imageLabel.textContent = "Image URL";
  imageLabel.className = "block text-white";
  form.appendChild(imageLabel);

  const imageInput = document.createElement("input");
  imageInput.value =
    listing.media && listing.media.length > 0 ? listing.media[0].url : "";
  imageInput.className = "w-full p-2 rounded bg-gray-700 text-white";
  form.appendChild(imageInput);

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "flex justify-between mt-4";

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.textContent = "Save";
  saveButton.className = "bg-green-500 px-4 py-2 text-white rounded";
  buttonWrapper.appendChild(saveButton);

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className = "bg-red-500 px-4 py-2 text-white rounded";
  cancelButton.addEventListener("click", () => {
    form.remove(); // Fjern kun skjemaet, behold innholdet
  });
  buttonWrapper.appendChild(cancelButton);

  form.appendChild(buttonWrapper);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const updated = {
      title: titleInput.value,
      description: descInput.value,
      media: [{ url: imageInput.value }],
    };

    fetch(`https://v2.api.noroff.dev/auction/listings/${listing.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Update failed");
        }
        return res.json();
      })
      .then(() => {
        location.reload(); // Oppdater for å vise endringer
      })
      .catch((err) => alert("Error updating listing: " + err.message));
  });

  card.appendChild(form);
}

function fetchBids(userName, wrapper) {
  fetch(
    `https://v2.api.noroff.dev/auction/profiles/${userName}/bids?_listings=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      const bids = data.data;

      const title = document.createElement("h2");
      title.textContent = "Listings I Have Bid On";
      title.className = "text-xl font-bold mt-10 text-center";
      wrapper.appendChild(title);

      if (bids.length === 0) {
        const noBidsMsg = document.createElement("p");
        noBidsMsg.textContent = "You haven't placed any bids yet.";
        noBidsMsg.className = "text-gray-500 text-center";
        wrapper.appendChild(noBidsMsg);
        return;
      }

      bids.forEach((bid) => {
        const listing = bid.listing;
        if (!listing) return;

        const card = document.createElement("div");
        card.className = "bg-gray-800 p-4 rounded-lg shadow-md mb-6";

        const title = document.createElement("h3");
        title.textContent = listing.title;
        title.className = "text-lg font-semibold text-white";
        card.appendChild(title);

        const imageUrl =
          listing.media && listing.media.length > 0 ? listing.media[0].url : "";
        const image = document.createElement("img");
        image.setAttribute("src", imageUrl);
        image.className = "w-full h-48 object-cover rounded-lg mb-4";
        card.appendChild(image);

        const yourBid = document.createElement("p");
        yourBid.textContent = `Your bid: ${bid.amount} credits`;
        yourBid.className = "text-green-400";
        card.appendChild(yourBid);

        const viewLink = document.createElement("a");
        viewLink.href = `/html/single-listing.html?id=${listing.id}`;
        viewLink.textContent = "View Listing";
        viewLink.className = "text-blue-500 hover:underline inline-block mt-2";
        card.appendChild(viewLink);

        wrapper.appendChild(card);
      });
    })
    .catch((error) => {
      const errorMsg = document.createElement("p");
      errorMsg.textContent = `Could not load bids: ${error.message}`;
      errorMsg.className = "text-red-500";
      wrapper.appendChild(errorMsg);
    });
}
