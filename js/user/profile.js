import { API_KEY } from "../api/auth.js";
import { toggleMenu, updateNavbarForUser } from "../ui/navbar.js";
import {
  showLogoutButtonIfLoggedIn,
  setupLogoutFunctionality,
} from "../ui/logout.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  updateNavbarForUser();
  loadUserProfile();
  fetchAndDisplayCredits();
});

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
      fetchAndRenderWins(userName, token, apiKey, wonBidsWrapper),
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

// Render profile information
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
  editButton.className =
    "mt-4 px-4 py-2 bg-black hover:bg-gray-700 text-white rounded";
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
  const wrapper = document.createElement("section");
  wrapper.className =
    "mt-8 bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden";

  const header = document.createElement("button");
  header.className =
    "w-full text-left px-6 py-4 bg-gray-800 hover:bg-gray-700 text-xl font-semibold text-white flex justify-between items-center focus:outline-none";
  header.setAttribute("aria-expanded", "true");

  const title =
    {
      myListings: "My Listings",
      myBids: "Listings I've Bid On",
      wonBids: "Auctions I've Won",
    }[id] || "Section";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = title;

  const icon = document.createElement("span");
  icon.textContent = "−";
  icon.className = "text-lg transition-transform duration-200";

  header.append(titleSpan, icon);
  wrapper.appendChild(header);

  const content = document.createElement("div");
  content.id = id;
  content.className = "px-6 pb-6 pt-4";
  wrapper.appendChild(content);

  header.addEventListener("click", () => {
    const expanded = header.getAttribute("aria-expanded") === "true";
    header.setAttribute("aria-expanded", String(!expanded));
    content.classList.toggle("hidden", expanded);
    icon.textContent = expanded ? "+" : "−";
  });

  parent.appendChild(wrapper);
  return content;
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

    listings.forEach((listing) => {
      const card = document.createElement("div");
      card.className = "bg-gray-800 p-4 rounded-lg shadow-md mb-6";

      // Title
      card.appendChild(
        createTextElement(
          "h2",
          listing.title,
          "text-lg font-semibold text-white"
        )
      );

      // Image
      const imageUrl =
        listing.media?.[0]?.url || "https://via.placeholder.com/400x300";
      card.appendChild(
        createImageElement(
          imageUrl,
          listing.title,
          "w-full h-48 object-cover rounded-lg mb-4"
        )
      );

      // Description
      card.appendChild(
        createTextElement(
          "p",
          listing.description || "No description available.",
          "text-gray-400"
        )
      );

      // View Listing button
      const viewButton = document.createElement("button");
      viewButton.type = "button";
      viewButton.textContent = "View Listing";
      viewButton.className = "btn-view-listing";
      viewButton.addEventListener("click", () => {
        window.location.href = `/html/single-listing.html?id=${listing.id}`;
      });
      card.appendChild(viewButton);

      // Edit button
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.className = "btn-edit";
      editButton.addEventListener("click", () => {
        showEditForm(listing, card, token, apiKey);
      });
      card.appendChild(editButton);

      // Delete button
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "btn-delete";
      deleteButton.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

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
      });
      card.appendChild(deleteButton);
      const btnWrapper = document.createElement("div");
      btnWrapper.className = "flex justify-center space-x-4 mt-4";

      btnWrapper.append(viewButton, editButton, deleteButton);
      card.appendChild(btnWrapper);

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

// Inline form for editing listing
function showEditForm(listing, wrapper, token, apiKey) {
  const editForm = document.createElement("form");
  editForm.className =
    "space-y-4 mt-4 p-4 bg-gray-700 rounded-lg shadow-lg overflow-x-hidden";

  // TITLE
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = listing.title || "";
  titleInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(titleInput);

  // DESCRIPTION
  const descriptionInput = document.createElement("textarea");
  descriptionInput.value = listing.description || "";
  descriptionInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(descriptionInput);

  // IMAGE FIELDS CONTAINER
  const imageContainer = document.createElement("div");
  imageContainer.className = "space-y-4 w-full";

  const addImageField = (url = "") => {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "flex flex-col space-y-2 w-full";

    const inputRow = document.createElement("div");
    inputRow.className = "flex items-center gap-2 flex-wrap min-w-0";

    const imageInput = document.createElement("input");
    imageInput.type = "url";
    imageInput.value = url;
    imageInput.placeholder = "Enter image URL";
    imageInput.className =
      "flex-1 min-w-0 p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.className =
      "px-1 py-0.5 text-sm sm:px-2 sm:py-1 sm:text-base text-white hover:text-red-400 bg-gray-800 rounded border border-gray-500 flex-shrink-0";
    removeBtn.addEventListener("click", () => fieldWrapper.remove());

    inputRow.append(imageInput, removeBtn);

    const preview = document.createElement("img");
    preview.className =
      "w-full sm:w-[240px] h-[160px] object-cover rounded border border-gray-600 mt-2";
    preview.style.display = url ? "block" : "none";
    if (url) preview.src = url;

    imageInput.addEventListener("input", () => {
      const val = imageInput.value.trim();
      preview.style.display = val ? "block" : "none";
      if (val) preview.src = val;
    });

    fieldWrapper.append(inputRow, preview);
    imageContainer.appendChild(fieldWrapper);
  };

  (listing.media || []).forEach((m) => {
    const url = typeof m === "string" ? m : m.url;
    addImageField(url);
  });
  if (!imageContainer.children.length) addImageField("");

  editForm.appendChild(imageContainer);

  // ADD IMAGE BUTTON
  const addImageBtn = document.createElement("button");
  addImageBtn.type = "button";
  addImageBtn.textContent = "+ Add more images";
  addImageBtn.className =
    "px-2 py-1 text-sm sm:px-4 sm:py-2 sm:text-base bg-gray-600 text-white rounded hover:bg-gray-700";
  addImageBtn.addEventListener("click", () => addImageField(""));
  editForm.appendChild(addImageBtn);

  // SAVE & CANCEL
  const btnWrapper = document.createElement("div");
  btnWrapper.className = "flex justify-center gap-4 mt-4";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Save Changes";
  submitButton.className =
    "px-2 py-1 text-sm sm:px-4 sm:py-2 sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className =
    "px-2 py-1 text-sm sm:px-4 sm:py-2 sm:text-base bg-red-500 text-white rounded hover:bg-red-600";
  cancelButton.addEventListener("click", () => editForm.remove());

  btnWrapper.append(submitButton, cancelButton);
  editForm.appendChild(btnWrapper);

  // SUBMIT HANDLER
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedFields = {};
    const titleValue = titleInput.value.trim();
    const descriptionValue = descriptionInput.value.trim();
    if (titleValue && titleValue !== listing.title) {
      updatedFields.title = titleValue;
    }
    if (descriptionValue !== (listing.description || "")) {
      updatedFields.description = descriptionValue;
    }

    const imageInputs = imageContainer.querySelectorAll("input[type='url']");
    const validMedia = Array.from(imageInputs)
      .map((i) => i.value.trim())
      .filter((u) => isValidUrl(u));
    const original = (listing.media || []).map((m) =>
      typeof m === "string" ? m : m.url
    );
    const changed =
      validMedia.length !== original.length ||
      validMedia.some((u, i) => u !== original[i]);
    if (changed) {
      updatedFields.media = validMedia.map((u) => ({
        url: u,
        alt: titleValue || listing.title || "Listing image",
      }));
    }

    if (!Object.keys(updatedFields).length) {
      alert("No changes made.");
      return;
    }

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/auction/listings/${listing.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFields),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errors?.[0]?.message || "Oppdatering feilet.");
      }
      alert("Listing updated successfully!");
      loadUserProfile();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  });

  wrapper.appendChild(editForm);
}

function isValidUrl(url) {
  const pattern = new RegExp(
    "^(https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%_\\+.~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)?)$"
  );
  return pattern.test(url);
}

async function fetchAndRenderWins(userName, token, apiKey, wrapper) {
  try {
    wrapper.innerHTML = "";

    const response = await fetch(
      `https://v2.api.noroff.dev/auction/profiles/${userName}/wins`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch won auctions.");
    }

    const { data: wins } = await response.json();

    if (wins.length === 0) {
      wrapper.appendChild(
        createTextElement(
          "p",
          "You haven't won any auctions yet.",
          "text-gray-500 text-center"
        )
      );
      return;
    }

    wins.forEach((listing) => {
      const card = document.createElement("div");
      card.className = "bg-gray-800 p-4 rounded-lg shadow-md mb-6";

      // Tittel
      card.appendChild(
        createTextElement(
          "h3",
          listing.title,
          "text-lg font-semibold text-white"
        )
      );

      // Bilde
      const imageUrl =
        listing.media?.[0]?.url || "https://via.placeholder.com/400x300";
      card.appendChild(
        createImageElement(
          imageUrl,
          listing.title,
          "w-full h-48 object-cover rounded-lg mb-4"
        )
      );

      // Beskrivelse
      card.appendChild(
        createTextElement(
          "p",
          listing.description || "No description available.",
          "text-gray-400"
        )
      );

      // View Listing-knapp
      const viewButton = document.createElement("button");
      viewButton.type = "button";
      viewButton.textContent = "View Listing";
      viewButton.className = "btn-view-listing";
      viewButton.addEventListener("click", () => {
        window.location.href = `/html/single-listing.html?id=${listing.id}`;
      });

      // Responsive wrapper for knapp
      const btnWrapper = document.createElement("div");
      btnWrapper.className =
        "flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mt-4";
      btnWrapper.appendChild(viewButton);

      card.appendChild(btnWrapper);
      wrapper.appendChild(card);
    });
  } catch (error) {
    wrapper.appendChild(
      createTextElement(
        "p",
        `Error loading wins: ${error.message}`,
        "text-red-500"
      )
    );
  }
}

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

  const viewButton = document.createElement("button");
  viewButton.type = "button";
  viewButton.textContent = "View Listing";
  viewButton.className = "btn-view-listing";
  viewButton.addEventListener("click", () => {
    window.location.href = `/html/single-listing.html?id=${bid.listing.id}`;
  });

  const btnWrapper = document.createElement("div");
  btnWrapper.className =
    "flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mt-4";
  btnWrapper.appendChild(viewButton);

  card.appendChild(btnWrapper);
  return card;
}

// Countdown timer
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

  updateTimer();
  const intervalId = setInterval(updateTimer, 1000);

  return timer;
}
