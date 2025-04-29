import { updateNavbarForUser, toggleMenu } from "../ui/navbar.js";
import {
  setupLogoutFunctionality,
  showLogoutButtonIfLoggedIn,
} from "../ui/logout.js";
import { API_KEY } from "../api/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  toggleMenu();
  updateNavbarForUser();
  showLogoutButtonIfLoggedIn();
  setupLogoutFunctionality();
});

const container = document.getElementById("listing-container");

// Get ID from URL (e.g. ?id=123)
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  const error = document.createElement("p");
  error.textContent = "No listing ID provided in the URL.";
  error.classList.add("text-red-400", "text-center", "mt-4");
  container.appendChild(error);
} else {
  fetchListing(id);
}

async function fetchListing(id) {
  const url = `https://v2.api.noroff.dev/auction/listings/${id}?_seller=true&_bids=true`;

  try {
    const response = await fetch(url);
    const { data } = await response.json();

    displayListing(data);
  } catch (error) {
    const errorEl = document.createElement("p");
    errorEl.textContent = "Could not load the listing.";
    errorEl.classList.add("text-red-400", "text-center", "mt-4");
    container.appendChild(errorEl);
    console.error(error);
  }
}

function displayListing(data) {
  const wrapper = document.createElement("div");
  wrapper.classList.add(
    "bg-gray-800",
    "p-6",
    "rounded-lg",
    "shadow-md",
    "max-w-3xl",
    "mx-auto",
    "mt-8"
  );

  const title = document.createElement("h1");
  title.textContent = data.title;
  title.classList.add("text-3xl", "font-bold", "text-white", "mb-4");

  const imageGallery = document.createElement("div");
  imageGallery.classList.add("flex", "flex-wrap", "gap-4", "mb-4");

  if (data.media.length > 0) {
    data.media.forEach((mediaItem) => {
      const img = document.createElement("img");
      img.setAttribute("src", mediaItem.url);
      img.setAttribute("alt", mediaItem.alt || "Listing image");
      img.classList.add(
        "w-full",
        "md:w-[48%]",
        "h-auto",
        "rounded-md",
        "object-cover",
        "max-w-full"
      );
      imageGallery.appendChild(img);
    });
  } else {
    const placeholder = document.createElement("img");
    placeholder.setAttribute(
      "src",
      "https://via.placeholder.com/600x400?text=No+image"
    );
    placeholder.setAttribute("alt", "No image available");
    placeholder.classList.add(
      "w-full",
      "h-auto",
      "rounded-md",
      "object-cover",
      "max-w-full"
    );
    imageGallery.appendChild(placeholder);
  }

  const description = document.createElement("p");
  description.textContent = data.description || "No description provided.";
  description.classList.add("text-gray-300", "mb-4");

  const seller = document.createElement("p");
  seller.textContent = `Seller: ${data.seller?.name || "Unknown"}`;
  seller.classList.add("text-gray-400", "mb-2");

  const endsAt = document.createElement("p");
  endsAt.textContent = `Ends: ${new Date(data.endsAt).toLocaleString("en-GB")}`;
  endsAt.classList.add("text-gray-400", "mb-4");

  const bids = document.createElement("div");
  bids.classList.add("bg-gray-700", "rounded-md", "p-4", "mt-6");

  const bidTitle = document.createElement("h2");
  bidTitle.textContent = "Bids:";
  bidTitle.classList.add("text-white", "text-xl", "font-semibold", "mb-2");
  bids.appendChild(bidTitle);

  if (data.bids && data.bids.length > 0) {
    data.bids.forEach((bid) => {
      const bidItem = document.createElement("p");
      bidItem.textContent = `${bid.bidderName} bid ${bid.amount} kr`;
      bidItem.classList.add("text-gray-200");
      bids.appendChild(bidItem);
    });
  } else {
    const noBids = document.createElement("p");
    noBids.textContent = "No bids yet.";
    noBids.classList.add("text-gray-400");
    bids.appendChild(noBids);
  }

  wrapper.appendChild(title);
  wrapper.appendChild(imageGallery);
  wrapper.appendChild(description);
  wrapper.appendChild(seller);
  wrapper.appendChild(endsAt);
  wrapper.appendChild(bids);

  container.appendChild(wrapper);

  // Brukerdata og token fra localStorage
  const profile = JSON.parse(localStorage.getItem("profile"));
  const currentUser = profile?.name;
  const accessToken = localStorage.getItem("accessToken");

  // Debugging logs
  console.log("Logged in user:", currentUser);
  console.log("Listing seller:", data.seller?.name);

  if (!currentUser) {
    console.warn("Ingen bruker funnet i localStorage.");
  } else if (currentUser.toLowerCase() === data.seller.name.toLowerCase()) {
    const ownerControls = document.createElement("div");
    ownerControls.classList.add("mt-6", "flex", "gap-4");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit listing";
    editButton.classList.add(
      "bg-yellow-500",
      "hover:bg-yellow-600",
      "text-black",
      "font-semibold",
      "py-2",
      "px-4",
      "rounded"
    );

    editButton.addEventListener("click", () => {
      const form = document.createElement("form");
      form.classList.add("mt-4", "space-y-4");

      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.value = data.title;
      titleInput.classList.add("w-full", "p-2", "rounded", "text-black");

      const descInput = document.createElement("textarea");
      descInput.value = data.description || "";
      descInput.classList.add("w-full", "p-2", "rounded", "text-black");

      const imgInput = document.createElement("input");
      imgInput.type = "url";
      imgInput.value = data.media[0]?.url || "";
      imgInput.classList.add("w-full", "p-2", "rounded", "text-black");

      const altInput = document.createElement("input");
      altInput.type = "text";
      altInput.placeholder = "Image alt text";
      altInput.value = data.media[0]?.alt || "";
      altInput.classList.add("w-full", "p-2", "rounded", "text-black");

      const submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.textContent = "Save changes";
      submitBtn.classList.add(
        "bg-blue-500",
        "text-white",
        "py-2",
        "px-4",
        "rounded"
      );

      form.append(titleInput, descInput, imgInput, altInput, submitBtn);
      wrapper.appendChild(form);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedData = {
          title: titleInput.value,
          description: descInput.value,
          media: [
            {
              url: imgInput.value,
              alt: altInput.value,
            },
          ],
        };

        try {
          const res = await fetch(
            `https://v2.api.noroff.dev/auction/listings/${data.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                "X-Noroff-API-Key": API_KEY,
              },
              body: JSON.stringify(updatedData),
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.errors?.[0]?.message || "Update failed");
          }

          alert("Listing updated successfully.");
          window.location.reload();
        } catch (err) {
          alert("Error updating listing: " + err.message);
        }
      });

      editButton.disabled = true;
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete listing";
    deleteButton.classList.add(
      "bg-red-600",
      "hover:bg-red-700",
      "text-white",
      "font-semibold",
      "py-2",
      "px-4",
      "rounded"
    );

    deleteButton.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this listing?")) {
        try {
          const response = await fetch(
            `https://v2.api.noroff.dev/auction/listings/${data.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Noroff-API-Key": API_KEY,
              },
            }
          );

          if (response.status === 204) {
            alert("Listing deleted successfully.");
            window.location.href = "/";
          } else {
            const error = await response.json();
            throw new Error(error.errors?.[0]?.message || "Delete failed");
          }
        } catch (err) {
          alert("Error deleting listing: " + err.message);
        }
      }
    });

    ownerControls.appendChild(editButton);
    ownerControls.appendChild(deleteButton);
    wrapper.appendChild(ownerControls);
  } else {
    console.warn("Innlogget bruker er ikke eier av annonsen.");
  }
}
