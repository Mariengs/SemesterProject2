import { getAccessToken, API_KEY } from "../api/auth.js";
import { fetchAndDisplayCredits } from "../ui/fetchCredits.js";

const apiUrl = "https://v2.api.noroff.dev/auction/listings";
let allListings = [];
let filteredListings = [];
let currentPage = 1;
const listingsPerPage = 21;
let timerInterval;

async function placeBid(listingId) {
  const modal = document.createElement("div");
  modal.id = "bidModal";
  modal.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "w-full",
    "h-full",
    "bg-gray-800",
    "bg-opacity-50",
    "flex",
    "justify-center",
    "items-center"
  );

  // Modal
  const modalContent = document.createElement("div");
  modalContent.classList.add("bg-gray-900", "p-8", "rounded-lg", "w-96");
  modal.appendChild(modalContent);

  // Modalcontent
  const title = document.createElement("h3");
  title.classList.add("text-2xl", "text-center", "text-white", "mb-4");
  title.textContent = "Place Your Bid";

  const description = document.createElement("p");
  description.classList.add("text-center", "text-gray-400", "mb-4");
  description.textContent = "Enter your bid amount for this listing.";

  const bidInput = document.createElement("input");
  bidInput.type = "number";
  bidInput.id = "bidAmount";
  bidInput.classList.add("w-full", "p-2", "rounded-md", "mb-4", "text-black");
  bidInput.placeholder = "Enter bid amount";
  bidInput.min = 1;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("flex", "justify-between");

  const placeBidButton = document.createElement("button");
  placeBidButton.textContent = "Place Bid";
  placeBidButton.classList.add(
    "bg-blue-500",
    "text-white",
    "px-4",
    "py-2",
    "rounded-md"
  );

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.classList.add(
    "bg-red-500",
    "text-white",
    "px-4",
    "py-2",
    "rounded-md"
  );

  buttonContainer.append(placeBidButton, cancelButton);
  modalContent.append(title, description, bidInput, buttonContainer);
  document.body.appendChild(modal);

  // Close modal
  cancelButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Bid
  placeBidButton.addEventListener("click", async () => {
    const bidAmount = parseFloat(document.getElementById("bidAmount").value);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert("You are not authenticated.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/${listingId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
        body: JSON.stringify({ amount: bidAmount }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Your bid has been placed successfully.");
        fetchListings(); // Update listings
      } else {
        alert(result.message || "Error placing bid.");
      }

      // Close modal after successful bid
      document.body.removeChild(modal);
    } catch (error) {
      alert("Failed to place bid: " + error.message);
      console.error("Error placing bid:", error);
    }
  });
}

export function buildUI() {
  const app = document.getElementById("app");

  // 🔍 Search container
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "relative mb-4 max-w-md mx-auto";

  const searchIcon = document.createElement("span");
  searchIcon.textContent = "🔍";
  searchIcon.className =
    "absolute left-3 top-2.5 text-gray-400 pointer-events-none";

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "✖️";
  clearBtn.className =
    "absolute right-3 top-2 text-gray-400 hover:text-white hidden";
  clearBtn.setAttribute("type", "button");

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "searchInput";
  searchInput.placeholder = "Search by title...";
  searchInput.className =
    "w-full pl-10 pr-10 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim();
    clearBtn.classList.toggle("hidden", value === "");
    currentPage = 1;
    applyFilters();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    currentPage = 1;
    applyFilters();
  });

  searchWrapper.append(searchIcon, clearBtn, searchInput);
  app.appendChild(searchWrapper);

  // ⬇️ Sorting select
  const sortSelect = document.createElement("select");
  sortSelect.id = "sortSelect";
  sortSelect.className =
    "bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 transition block mx-auto";

  [
    { value: "none", label: "No sorting" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "mostBids", label: "Most Bids" },
    { value: "fewestBids", label: "Fewest Bids" },
    { value: "highestBid", label: "Highest Bid" },
    { value: "lowestBid", label: "Lowest Bid" },
  ].forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    sortSelect.appendChild(option);
  });

  app.appendChild(sortSelect);

  // ✅ Active Listings Filter
  const activeFilterWrapper = document.createElement("div");
  activeFilterWrapper.className = "flex items-center justify-center mb-6";

  const activeCheckbox = document.createElement("input");
  activeCheckbox.type = "checkbox";
  activeCheckbox.id = "activeOnly";
  activeCheckbox.className = "mr-2 rounded text-blue-500 focus:ring-blue-500";

  const activeLabel = document.createElement("label");
  activeLabel.setAttribute("for", "activeOnly");
  activeLabel.textContent = "Show only active listings";
  activeLabel.className = "text-white";

  activeFilterWrapper.appendChild(activeCheckbox);
  activeFilterWrapper.appendChild(activeLabel);
  app.appendChild(activeFilterWrapper);

  // Listings container
  const listingsContainer = document.createElement("div");
  listingsContainer.id = "listings";
  listingsContainer.className =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
  app.appendChild(listingsContainer);

  // Pagination
  const paginationWrapper = document.createElement("div");
  paginationWrapper.id = "pagination";
  paginationWrapper.className = "flex justify-center items-center gap-4 mt-8";

  const prevPage = document.createElement("button");
  prevPage.id = "prevPage";
  prevPage.textContent = "Previous";
  prevPage.className =
    "bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600";

  const pageInfo = document.createElement("span");
  pageInfo.id = "pageInfo";
  pageInfo.className = "text-white";

  const nextPage = document.createElement("button");
  nextPage.id = "nextPage";
  nextPage.textContent = "Next";
  nextPage.className =
    "bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600";

  paginationWrapper.append(prevPage, pageInfo, nextPage);
  app.appendChild(paginationWrapper);
}

// Fetch listings
export async function fetchListings() {
  try {
    const response = await fetch(
      `${apiUrl}?_bids=true&_sort=created&sortOrder=desc&limit=100`
    );

    const result = await response.json();
    allListings = result.data;
    applyFilters();
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}

// Filter and sorting
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const sortBy = document.getElementById("sortSelect").value;
  const activeOnly = document.getElementById("activeOnly").checked;

  filteredListings = allListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm);
    const isActive = new Date(listing.endsAt) > new Date();
    return matchesSearch && (!activeOnly || isActive);
  });

  // Sort
  filteredListings.sort((a, b) => {
    const isAActive = new Date(a.endsAt) > new Date();
    const isBActive = new Date(b.endsAt) > new Date();

    if (isAActive && !isBActive) return -1;
    if (!isAActive && isBActive) return 1;

    const aBid = a.bids?.length ? Math.max(...a.bids.map((b) => b.amount)) : 0;
    const bBid = b.bids?.length ? Math.max(...b.bids.map((b) => b.amount)) : 0;

    switch (sortBy) {
      case "newest":
        return new Date(b.created) - new Date(a.created);
      case "oldest":
        return new Date(a.created) - new Date(b.created);
      case "mostBids":
        return (b.bids?.length || 0) - (a.bids?.length || 0);
      case "fewestBids":
        return (a.bids?.length || 0) - (b.bids?.length || 0);
      case "highestBid":
        return bBid - aBid;
      case "lowestBid":
        return aBid - bBid;
      default:
        return 0;
    }
  });

  displayListings();
}

// Show listings
function displayListings() {
  const listingsContainer = document.getElementById("listings");
  listingsContainer.innerHTML = "";

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const start = (currentPage - 1) * listingsPerPage;
  const end = start + listingsPerPage;
  const listingsToShow = filteredListings.slice(start, end);

  if (listingsToShow.length === 0) {
    const noResults = document.createElement("p");
    noResults.textContent = "No results.";
    listingsContainer.appendChild(noResults);
    return;
  }

  listingsToShow.forEach((listing) => {
    const card = document.createElement("div");
    card.classList.add(
      "bg-gray-800",
      "p-6",
      "rounded-lg",
      "shadow-md",
      "hover:shadow-xl",
      "transition",
      "duration-300",
      "ease-in-out"
    );

    const imageUrl =
      listing.media?.[0]?.url ||
      "https://via.placeholder.com/300x200?text=Ingen+bilde";
    const imageAlt = listing.media?.[0]?.alt || "Placeholder-image";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = imageAlt;
    img.loading = "lazy";
    img.classList.add("w-full", "h-48", "object-cover", "rounded-md", "mb-4");

    const title = document.createElement("h3");
    title.classList.add("text-xl", "font-semibold", "text-gray-200", "mb-2");
    title.textContent = listing.title;

    const description = document.createElement("p");
    description.classList.add("text-gray-400", "mb-4");
    description.textContent = listing.description || "No description.";

    const countdownContainer = document.createElement("div");
    countdownContainer.classList.add("text-gray-300", "mb-4");

    function updateCountdown() {
      const now = new Date().getTime();
      const endTime = new Date(listing.endsAt).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        countdownContainer.textContent = "Auction ended";
        countdownContainer.classList.remove("text-gray-300");
        countdownContainer.classList.add("text-red-400", "font-semibold");
        clearInterval(timerInterval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownContainer.textContent = `Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        countdownContainer.classList.remove("text-red-400", "font-semibold");
        countdownContainer.classList.add("text-gray-300");
      }
    }

    updateCountdown();
    timerInterval = setInterval(updateCountdown, 1000);

    const highestBid = listing.bids?.length
      ? Math.max(...listing.bids.map((b) => b.amount))
      : 0;
    const bidDisplay = document.createElement("div");
    bidDisplay.classList.add(
      "text-xl",
      "font-semibold",
      "text-gray-200",
      "mb-2"
    );
    bidDisplay.innerHTML = `<strong>Highest bid:</strong> ${highestBid} kr`;

    const bidButton = document.createElement("button");
    bidButton.type = "button";
    bidButton.textContent = "Place Bid";
    bidButton.className = "btn-place-bid";
    bidButton.setAttribute("aria-label", "Place Bid");
    bidButton.addEventListener("click", (e) => {
      e.preventDefault();
      placeBid(listing.id);
    });

    const infoButton = document.createElement("button");
    infoButton.textContent = "More Info";
    infoButton.classList.add(
      "bg-gray-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "mt-4",
      "w-full"
    );
    infoButton.addEventListener("click", () => {
      window.location.href = `/html/single-listing.html?id=${listing.id}`;
    });

    card.append(img, title, description, countdownContainer, bidDisplay);

    if (isLoggedIn) {
      card.appendChild(bidButton);
    }

    card.appendChild(infoButton);

    listingsContainer.appendChild(card);
  });

  updatePagination();
}

// Paginering
function updatePagination() {
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  buildUI();
  fetchListings();
  fetchAndDisplayCredits();

  window.addEventListener("listingCreated", () => {
    fetchListings();
    fetchAndDisplayCredits();
  });

  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById("sortSelect").addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayListings();
      updatePagination();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayListings();
      updatePagination();
      window.scrollTo(0, 0);
    }
  });
  document.getElementById("activeOnly").addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
});
