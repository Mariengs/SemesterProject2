// Import necessary modules
import { API_KEY } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";

// Initialize navigation menu and logout functionality
document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  updateNavbarForUser();
  loadUserProfile();
});

// Main function to load user profile
async function loadUserProfile() {
  const container = document.getElementById("profileContainer");
  const token = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");
  const apiKey = API_KEY;

  if (!token || !userName || !apiKey) {
    displayError(container, "You must be logged in to view your profile.");
    return;
  }

  try {
    const profileData = await fetchProfileData(userName, token, apiKey);
    renderProfile(container, profileData);

    const listingsWrapper = createSectionWrapper(container, "myListings");
    const bidsWrapper = createSectionWrapper(container, "myBids");
    const wonBidsWrapper = createSectionWrapper(container, "wonBids");

    await Promise.all([
      fetchAndRenderListings(userName, token, apiKey, listingsWrapper),
      fetchAndRenderBids(userName, token, apiKey, bidsWrapper, wonBidsWrapper),
    ]);
  } catch (error) {
    displayError(container, `Could not load profile: ${error.message}`);
  }
}

// Function to fetch profile data
async function fetchProfileData(userName, token, apiKey) {
  const response = await fetch(
    `https://v2.api.noroff.dev/auction/profiles/${userName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch profile information.");
  }

  const { data } = await response.json();
  return data;
}

// Function to render profile information
function renderProfile(container, data) {
  container.innerHTML = "";

  const bannerUrl = data.banner?.url || "https://via.placeholder.com/800x200";
  const avatarUrl = data.avatar?.url || "https://via.placeholder.com/100";

  container.appendChild(
    createImageElement(
      bannerUrl,
      data.banner?.alt || "Banner",
      "w-full h-48 object-cover rounded-lg mb-4"
    )
  );
  container.appendChild(
    createImageElement(
      avatarUrl,
      data.avatar?.alt || "Avatar",
      "w-24 h-24 rounded-full mx-auto border-4 border-gray-700 -mt-16 bg-gray-900 object-cover"
    )
  );

  container.appendChild(
    createTextElement("h1", data.name, "text-2xl font-bold mt-4 text-center")
  );
  container.appendChild(
    createTextElement("p", data.email, "text-gray-400 text-center")
  );
  container.appendChild(
    createTextElement(
      "p",
      data.bio || "No bio available.",
      "text-gray-400 text-center"
    )
  );
  container.appendChild(
    createTextElement(
      "p",
      `Credits: ${data.credits}`,
      "text-lg font-semibold text-green-400 text-center mt-2"
    )
  );

  const editButton = document.createElement("button");
  editButton.textContent = "Edit Profile";
  editButton.className = "mt-4 px-4 py-2 bg-blue-500 text-white rounded";
  editButton.addEventListener("click", () => {
    window.location.href = "/html/edit-profile.html";
  });
  container.appendChild(editButton);
}

// Utility: Create image elements
function createImageElement(src, alt, className) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = className;
  return img;
}

// Utility: Create text elements
function createTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

// Utility: Display error messages
function displayError(container, message) {
  container.innerHTML = "";
  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  errorMsg.className = "text-red-500";
  container.appendChild(errorMsg);
}

// Utility: Create section wrappers
function createSectionWrapper(parent, id) {
  const wrapper = document.createElement("div");
  wrapper.id = id;
  wrapper.className = "mt-8";
  parent.appendChild(wrapper);
  return wrapper;
}

// Fetch and render user listings
async function fetchAndRenderListings(userName, token, apiKey, wrapper) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}/listings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch listings.");
    }

    const { data: listings } = await response.json();

    wrapper.appendChild(
      createTextElement("h2", "My Listings", "text-xl font-bold text-center")
    );

    if (listings.length === 0) {
      wrapper.appendChild(
        createTextElement(
          "p",
          "You have no listings yet.",
          "text-gray-500 text-center"
        )
      );
      return;
    }

    listings.forEach((listing) => {
      const card = document.createElement("div");
      card.className = "bg-gray-800 p-4 rounded-lg shadow-md mb-6";

      card.appendChild(
        createTextElement(
          "h3",
          listing.title,
          "text-lg font-semibold text-white"
        )
      );

      const imageUrl =
        listing.media?.[0]?.url || "https://via.placeholder.com/400x300";
      card.appendChild(
        createImageElement(
          imageUrl,
          listing.title,
          "w-full h-48 object-cover rounded-lg mb-4"
        )
      );

      card.appendChild(
        createTextElement(
          "p",
          listing.description || "No description available.",
          "text-gray-400"
        )
      );

      const viewLink = document.createElement("a");
      viewLink.href = `/html/single-listing.html?id=${listing.id}`;
      viewLink.textContent = "View Listing";
      viewLink.className = "text-blue-500 hover:underline mt-4 inline-block";
      card.appendChild(viewLink);

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className =
        "ml-4 text-yellow-500 hover:underline inline-block";
      editButton.addEventListener("click", () => {
        showEditForm(listing, card, token, apiKey);
      });
      card.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "ml-4 text-red-500 hover:underline inline-block";
      deleteButton.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this listing?")) {
          try {
            const deleteResponse = await fetch(
              `https://v2.api.noroff.dev/auction/listings/${listing.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Noroff-API-Key": apiKey,
                },
              }
            );

            if (!deleteResponse.ok) {
              throw new Error("Failed to delete the listing.");
            }

            card.remove();
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        }
      });
      card.appendChild(deleteButton);

      wrapper.appendChild(card);
    });
  } catch (error) {
    wrapper.appendChild(
      createTextElement(
        "p",
        `Error loading listings: ${error.message}`,
        "text-red-500"
      )
    );
  }
}

// Function to show edit form inline
function showEditForm(listing, card, token, apiKey) {
  // Create an edit form with the current values
  const editForm = document.createElement("form");
  editForm.className = "space-y-4 mt-4 p-4 bg-gray-700 rounded-lg shadow-lg";

  // Title input field
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = listing.title;
  titleInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(titleInput);

  // Description input field
  const descriptionInput = document.createElement("textarea");
  descriptionInput.value = listing.description || "";
  descriptionInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(descriptionInput);

  // Image URL input field
  const imageInput = document.createElement("input");
  imageInput.type = "url";
  imageInput.value = listing.media?.[0]?.url || "";
  imageInput.placeholder = "Enter image URL (optional)";
  imageInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(imageInput);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Save Changes";
  submitButton.className =
    "px-4 py-2 bg-blue-500 text-white rounded mt-4 hover:bg-blue-600";
  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const updatedFields = {};

      // Only update the title if it's changed
      if (titleInput.value !== listing.title) {
        updatedFields.title = titleInput.value;
      }

      // Only update the description if it's changed
      if (descriptionInput.value !== listing.description) {
        updatedFields.description = descriptionInput.value;
      }

      // Only update the image URL if it's changed
      const imageUrl = imageInput.value;
      if (
        imageUrl &&
        imageUrl !== listing.media?.[0]?.url &&
        isValidUrl(imageUrl)
      ) {
        updatedFields.media = [{ url: imageUrl }];
      }

      // If there are no updates, exit
      if (Object.keys(updatedFields).length === 0) {
        alert("No changes made.");
        return;
      }

      // Send the update request
      const response = await fetch(
        `https://v2.api.noroff.dev/auction/listings/${listing.id}`,
        {
          method: "PUT", // Use PUT method for updating
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFields),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the listing.");
      }

      // Update the card with new values
      if (updatedFields.title) {
        listing.title = updatedFields.title;
        card.querySelector("h3").textContent = listing.title;
      }

      if (updatedFields.description) {
        listing.description = updatedFields.description;
        card.querySelector("p").textContent =
          listing.description || "No description available.";
      }

      if (updatedFields.media) {
        listing.media = updatedFields.media;
        const updatedImage =
          listing.media?.[0]?.url || "https://via.placeholder.com/400x300";
        card.querySelector("img").src = updatedImage;
      }

      // Remove the edit form
      editForm.remove();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  editForm.appendChild(submitButton);

  // Cancel button
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.type = "button";
  cancelButton.className =
    "px-4 py-2 bg-red-500 text-white rounded mt-4 hover:bg-red-600";
  cancelButton.addEventListener("click", () => {
    editForm.remove();
  });
  editForm.appendChild(cancelButton);

  // Append the form under the card
  card.appendChild(editForm);
}

// Utility function to check if the URL is valid
function isValidUrl(url) {
  const pattern = new RegExp(
    "^(https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%_\\+.~#?&//=]{2,256}\\.[a-z]{2,6}\\b([a-zA-Z0-9@:%_\\+.~#?&//=]*)?)$"
  );
  return pattern.test(url);
}

// Fetch and render bids (active and won)
async function fetchAndRenderBids(
  userName,
  token,
  apiKey,
  bidsWrapper,
  wonBidsWrapper
) {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}/bids?_listings=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch bids.");
    }

    const { data: bids } = await response.json();

    // Active Bids
    bidsWrapper.appendChild(
      createTextElement(
        "h2",
        "Listings I've Bid On",
        "text-xl font-bold text-center mt-8"
      )
    );

    const activeBids = bids.filter(
      (bid) => new Date(bid.listing.endsAt) > new Date()
    );
    if (activeBids.length === 0) {
      bidsWrapper.appendChild(
        createTextElement(
          "p",
          "You haven't placed any active bids.",
          "text-gray-500 text-center"
        )
      );
    } else {
      activeBids.forEach((bid) => {
        const card = createBidCard(bid);
        bidsWrapper.appendChild(card);
      });
    }

    // Won Bids
    wonBidsWrapper.appendChild(
      createTextElement(
        "h2",
        "Auctions I've Won",
        "text-xl font-bold text-center mt-8"
      )
    );

    const wonBids = bids.filter((bid) => {
      const isEnded = new Date(bid.listing.endsAt) < new Date();
      const isHighest = bid.listing.highestBid?.bidderName === userName;
      return isEnded && isHighest;
    });

    if (wonBids.length === 0) {
      wonBidsWrapper.appendChild(
        createTextElement(
          "p",
          "You haven't won any auctions yet.",
          "text-gray-500 text-center"
        )
      );
    } else {
      wonBids.forEach((bid) => {
        const card = createBidCard(bid);
        wonBidsWrapper.appendChild(card);
      });
    }
  } catch (error) {
    bidsWrapper.appendChild(
      createTextElement(
        "p",
        `Error loading bids: ${error.message}`,
        "text-red-500"
      )
    );
  }
}

function createBidCard(bid) {
  const card = document.createElement("div");
  card.className = "bg-gray-800 p-4 rounded-lg shadow-md mb-6";

  card.appendChild(
    createTextElement(
      "h3",
      bid.listing.title,
      "text-lg font-semibold text-white"
    )
  );

  const imageUrl =
    bid.listing.media?.[0]?.url || "https://via.placeholder.com/400x300";
  card.appendChild(
    createImageElement(
      imageUrl,
      bid.listing.title,
      "w-full h-48 object-cover rounded-lg mb-4"
    )
  );

  card.appendChild(
    createTextElement("p", `Your bid: ${bid.amount} credits`, "text-gray-400")
  );

  const countdown = createCountdownTimer(new Date(bid.listing.endsAt));
  card.appendChild(countdown);

  const viewLink = document.createElement("a");
  viewLink.href = `/html/single-listing.html?id=${bid.listing.id}`;
  viewLink.textContent = "View Listing";
  viewLink.className = "text-blue-500 hover:underline mt-4 inline-block";
  card.appendChild(viewLink);

  return card;
}

// Utility: Create countdown timer
function createCountdownTimer(endDate) {
  const timer = document.createElement("p");
  timer.className = "text-gray-400";

  function updateTimer() {
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) {
      timer.textContent = "Auction ended";
      clearInterval(intervalId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    timer.textContent = `Ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateTimer(); // Initial run
  const intervalId = setInterval(updateTimer, 1000);

  return timer;
}
