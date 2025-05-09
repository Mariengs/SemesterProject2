import { updateNavbarForUser, toggleMenu } from "../ui/navbar.js";
import {
  setupLogoutFunctionality,
  showLogoutButtonIfLoggedIn,
} from "../ui/logout.js";
import { API_KEY } from "../api/auth.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";
import { updateNavVisibility } from "../ui/authHelpers.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
  fetchAndDisplayCredits();
  updateNavVisibility();
});

const container = document.getElementById("listing-container");
container.className = "w-full flex justify-center px-4";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  showError("No listing ID provided in the URL.");
} else {
  fetchListing(id);
}

function showError(message) {
  const error = document.createElement("p");
  error.textContent = message;
  error.classList.add("text-red-400", "text-center", "mt-4");
  container.appendChild(error);
}

function createInfoParagraph(text) {
  const p = document.createElement("p");
  p.textContent = text;
  p.className = "text-gray-300 mb-2";
  return p;
}

function createStyledButton(text, classNames) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = `${classNames} font-semibold py-2 px-4 rounded transition`;
  return btn;
}

function timeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function createBidList(bidsArray) {
  const section = document.createElement("section");
  section.className = "bg-gray-700 rounded-md p-6 mt-6 shadow w-full max-w-xl";

  const header = document.createElement("h1");
  header.textContent = "Last 5 bids";
  header.className = "text-lg font-semibold text-white mb-3 text-center";
  section.appendChild(header);

  if (bidsArray.length === 0) {
    const noBids = document.createElement("p");
    noBids.textContent = "No bids yet.";
    noBids.className = "text-gray-400 text-center";
    section.appendChild(noBids);
  } else {
    const latestFive = [...bidsArray]
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 5);

    latestFive.forEach((bid, index) => {
      const bidItem = document.createElement("div");
      bidItem.className = `flex flex-col sm:flex-row sm:justify-between sm:items-center px-6 py-3 rounded border border-gray-600 ${
        index % 2 === 0 ? "bg-gray-800" : "bg-gray-600"
      }`;

      const bidderInfo = document.createElement("div");
      bidderInfo.className = "text-white font-medium";
      bidderInfo.textContent = bid.bidder?.name || "Anonymous";

      const meta = document.createElement("div");
      meta.className =
        "flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base";

      const amount = document.createElement("span");
      amount.className = "text-green-400 font-semibold";
      amount.textContent = `${bid.amount} kr`;

      const time = document.createElement("span");
      time.className = "text-gray-400 italic";
      time.textContent = timeAgo(bid.created);

      meta.append(amount, time);
      bidItem.append(bidderInfo, meta);
      section.appendChild(bidItem);
    });
  }

  return section;
}

function createBidButton(data, token) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Place a bid";
  btn.className = "btn-bid";
  btn.setAttribute("aria-label", "Place a bid");

  btn.addEventListener("click", () => {
    showBidModal(data.id, token);
  });

  const wrapper = document.createElement("div");
  wrapper.className = "mt-6 flex justify-center";
  wrapper.appendChild(btn);
  return wrapper;
}

function showBidModal(listingId, token) {
  // Modal overlay
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50";

  // Modal content
  const modal = document.createElement("div");
  modal.className =
    "bg-gray-800 p-6 rounded-lg w-full max-w-sm relative shadow-lg";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.className =
    "absolute top-2 right-2 text-white text-xl hover:text-red-400";
  closeBtn.addEventListener("click", () => document.body.removeChild(overlay));

  const heading = document.createElement("h2");
  heading.textContent = "Place your bid";
  heading.className = "text-white text-xl font-bold mb-2 text-center";

  const highestBidText = document.createElement("p");
  highestBidText.className = "text-gray-300 text-center mb-4";
  highestBidText.textContent = "Loading highest bid...";

  // Fetch highest bid from API
  fetch(`https://v2.api.noroff.dev/auction/listings/${listingId}?_bids=true`)
    .then((res) => res.json())
    .then(({ data }) => {
      const highest =
        data.bids.length > 0
          ? Math.max(...data.bids.map((bid) => bid.amount))
          : 0;
      highestBidText.textContent = `Highest bid: ${highest} kr`;
    })
    .catch(() => {
      highestBidText.textContent = "Could not load highest bid.";
    });

  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = "Enter amount (kr)";
  input.className =
    "w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-2";

  const error = document.createElement("p");
  error.className = "text-red-400 text-sm mb-2 hidden";

  const btnGroup = document.createElement("div");
  btnGroup.className = "flex justify-between gap-4 mt-4";

  const cancel = createStyledButton("Cancel", "bg-gray-600 hover:bg-gray-700");
  cancel.addEventListener("click", () => document.body.removeChild(overlay));

  const submit = createStyledButton(
    "Submit",
    "bg-green-600 hover:bg-green-700"
  );
  submit.addEventListener("click", async () => {
    const amount = Number(input.value);
    if (!amount || amount <= 0) {
      error.textContent = "Please enter a valid bid amount.";
      error.classList.remove("hidden");
      return;
    }

    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/auction/listings/${listingId}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_KEY,
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.errors?.[0]?.message || "Bid failed.");
      }

      alert("Your bid was successfully placed!");
      document.body.removeChild(overlay);
      window.location.reload();
    } catch (err) {
      error.textContent = "Error: " + err.message;
      error.classList.remove("hidden");
    }
  });

  btnGroup.append(cancel, submit);
  modal.append(closeBtn, heading, highestBidText, input, error, btnGroup);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function showEditForm(listing, wrapper, token, apiKey) {
  const editForm = document.createElement("form");
  editForm.className = "space-y-4 mt-4 p-4 bg-gray-700 rounded-lg shadow-lg";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = listing.title;
  titleInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(titleInput);

  const descriptionInput = document.createElement("textarea");
  descriptionInput.value = listing.description || "";
  descriptionInput.className =
    "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  editForm.appendChild(descriptionInput);

  const imageContainer = document.createElement("div");
  imageContainer.className = "space-y-4";

  const addImageField = (url = "") => {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "flex flex-col space-y-2";

    const inputRow = document.createElement("div");
    inputRow.className = "flex items-center gap-2";

    const imageInput = document.createElement("input");
    imageInput.type = "url";
    imageInput.value = url;
    imageInput.placeholder = "Enter image URL";
    imageInput.className =
      "w-full p-2 border rounded bg-gray-800 text-white border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.className =
      "text-white text-lg hover:text-red-400 bg-gray-800 px-3 py-1 rounded border border-gray-500";
    removeBtn.addEventListener("click", () => {
      fieldWrapper.remove();
    });

    inputRow.appendChild(imageInput);
    inputRow.appendChild(removeBtn);

    const preview = document.createElement("img");
    preview.className =
      "w-full max-h-64 object-contain rounded border border-gray-600 hidden";

    if (isValidUrl(url)) {
      preview.src = url;
      preview.classList.remove("hidden");
    }

    imageInput.addEventListener("input", () => {
      if (isValidUrl(imageInput.value)) {
        preview.src = imageInput.value;
        preview.classList.remove("hidden");
      } else {
        preview.classList.add("hidden");
      }
    });

    fieldWrapper.appendChild(inputRow);
    fieldWrapper.appendChild(preview);
    imageContainer.appendChild(fieldWrapper);
  };

  // Add existing images
  (listing.media || []).forEach((media) => {
    if (isValidUrl(media.url)) {
      addImageField(media.url);
    }
  });

  // Add one blank field if none exist
  if (imageContainer.children.length === 0) {
    addImageField(""); // 👈 always blank
  }

  const addImageBtn = document.createElement("button");
  addImageBtn.type = "button";
  addImageBtn.textContent = "+ Add more images";
  addImageBtn.className =
    "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700";
  addImageBtn.addEventListener("click", () => addImageField("")); // 👈 always blank

  editForm.appendChild(imageContainer);
  editForm.appendChild(addImageBtn);

  // Submit and cancel buttons
  const submitButton = document.createElement("button");
  submitButton.textContent = "Save Changes";
  submitButton.className =
    "px-4 py-2 bg-blue-500 text-white rounded mt-4 hover:bg-blue-600";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.type = "button";
  cancelButton.className =
    "px-4 py-2 bg-red-500 text-white rounded mt-4 hover:bg-red-600";

  const btnWrapper = document.createElement("div");
  btnWrapper.className = "flex gap-4";
  btnWrapper.appendChild(submitButton);
  btnWrapper.appendChild(cancelButton);

  cancelButton.addEventListener("click", () => {
    editForm.remove();
  });

  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const updatedFields = {};

    if (titleInput.value !== listing.title) {
      updatedFields.title = titleInput.value;
    }

    if (descriptionInput.value !== listing.description) {
      updatedFields.description = descriptionInput.value;
    }

    const imageInputs = imageContainer.querySelectorAll("input[type='url']");
    const validMedia = Array.from(imageInputs)
      .map((input) => input.value.trim())
      .filter((url) => isValidUrl(url));

    if (validMedia.length > 0) {
      updatedFields.media = validMedia.map((url) => ({ url }));
    }

    if (Object.keys(updatedFields).length === 0) {
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

      if (!res.ok) throw new Error("Failed to update the listing.");

      alert("Listing updated!");
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

  editForm.appendChild(btnWrapper);
  wrapper.appendChild(editForm);
}

function isValidUrl(url) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?([\\w.-]+)+(:\\d+)?(\\/\\S*)?$",
    "i"
  );
  return pattern.test(url);
}

async function fetchListing(id) {
  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/auction/listings/${id}?_seller=true&_bids=true`
    );
    const { data } = await res.json();
    displayListing(data);
  } catch (err) {
    showError("Could not load the listing.");
    console.error(err);
  }
}

function displayListing(data) {
  const wrapper = document.createElement("div");
  wrapper.className =
    "flex flex-col items-center bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto mt-8";

  const title = document.createElement("h1");
  title.textContent = data.title;
  title.className = "text-4xl font-bold text-white mb-6 text-center";

  const imageGallery = document.createElement("div");
  imageGallery.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full";

  if (data.media.length > 0) {
    data.media.forEach(({ url, alt }) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = alt || "Listing image";
      img.className =
        "w-full h-auto object-cover rounded cursor-pointer border border-gray-600";

      img.addEventListener("click", () => showImageModal(url, alt));
      imageGallery.appendChild(img);
    });
  } else {
    const placeholder = document.createElement("img");
    placeholder.src = "https://via.placeholder.com/600x400?text=No+image";
    placeholder.alt = "No image available";
    placeholder.className = "w-full h-auto object-cover rounded";
    imageGallery.appendChild(placeholder);
  }

  const description = createInfoParagraph(
    data.description || "No description provided."
  );
  const seller = createInfoParagraph(
    `Seller: ${data.seller?.name || "Unknown"}`
  );

  const endsAt = document.createElement("p");
  endsAt.className = "text-gray-300 mb-2";
  const countdownInterval = setInterval(() => {
    const timeLeft = new Date(data.endsAt).getTime() - new Date().getTime();
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      endsAt.textContent = "Auction ended.";
      endsAt.className = "text-red-400 text-lg font-semibold text-center mt-2";
      return;
    }
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    endsAt.textContent = `Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);

  const bidsSection = createBidList(data.bids);

  wrapper.append(title, imageGallery, description, seller, endsAt, bidsSection);
  container.appendChild(wrapper);

  const profile = JSON.parse(localStorage.getItem("profile"));
  const currentUser = profile?.name;
  const accessToken = localStorage.getItem("accessToken");

  const hasAuctionEnded = new Date(data.endsAt) < new Date();

  if (
    !hasAuctionEnded &&
    currentUser?.toLowerCase() !== data.seller.name.toLowerCase() &&
    accessToken
  ) {
    wrapper.appendChild(createBidButton(data, accessToken));
  }

  if (currentUser?.toLowerCase() === data.seller.name.toLowerCase()) {
    const ownerControls = document.createElement("div");
    ownerControls.className = "flex gap-4 mt-6";

    const editBtn = createStyledButton(
      "Edit",
      "bg-blue-600 hover:bg-blue-700 text-white"
    );
    editBtn.addEventListener("click", () => {
      showEditForm(data, wrapper, accessToken, API_KEY);
    });

    const deleteBtn = createStyledButton(
      "Delete",
      "bg-red-600 hover:bg-red-700 text-white"
    );
    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Are you sure you want to delete this listing?"
      );
      if (!confirmed) return;

      try {
        const res = await fetch(
          `https://v2.api.noroff.dev/auction/listings/${data.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "X-Noroff-API-Key": API_KEY,
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.errors?.[0]?.message || "Delete failed.");
        }

        alert("Listing deleted successfully.");
        window.location.href = "/html/profile.html";
      } catch (err) {
        alert("Error deleting listing: " + err.message);
      }
    });

    ownerControls.append(editBtn, deleteBtn);
    wrapper.appendChild(ownerControls);
  }

  function showImageModal(url, alt) {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50";

    const modal = document.createElement("div");
    modal.className = "relative";

    const img = document.createElement("img");
    img.src = url;
    img.alt = alt || "Enlarged image";
    img.className = "max-w-full max-h-[90vh] rounded shadow-lg";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.className =
      "absolute top-0 right-0 m-2 text-white text-2xl hover:text-red-400";
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(img);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
}
