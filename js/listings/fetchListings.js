// listings.js

import { getAccessToken, API_KEY } from "../api/auth.js";

const apiUrl = "https://v2.api.noroff.dev/auction/listings";
let allListings = [];
let filteredListings = [];
let currentPage = 1;
const listingsPerPage = 21;

// UI-bygging
export function buildUI() {
  const app = document.getElementById("app");

  // Søkeinput
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "searchInput";
  searchInput.placeholder = "Search by title...";
  searchInput.classList.add(
    "bg-gray-700",
    "text-white",
    "rounded-md",
    "p-2",
    "mb-4",
    "w-full",
    "sm:w-auto"
  );
  app.appendChild(searchInput);

  // Sortering
  const sortSelect = document.createElement("select");
  sortSelect.id = "sortSelect";
  sortSelect.classList.add(
    "bg-gray-700",
    "text-white",
    "rounded-md",
    "p-2",
    "mb-4",
    "w-full",
    "sm:w-auto"
  );

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

  sortSelect.value = "none";
  app.appendChild(sortSelect);

  // Listings container
  const listingsContainer = document.createElement("div");
  listingsContainer.id = "listings";
  listingsContainer.classList.add(
    "grid",
    "grid-cols-1",
    "sm:grid-cols-2",
    "lg:grid-cols-3",
    "gap-6"
  );
  app.appendChild(listingsContainer);

  // Pagination
  const paginationWrapper = document.createElement("div");
  paginationWrapper.id = "pagination";

  const prevPage = document.createElement("button");
  prevPage.id = "prevPage";
  prevPage.textContent = "Previous";

  const pageInfo = document.createElement("span");
  pageInfo.id = "pageInfo";
  pageInfo.style.margin = "0 10px";

  const nextPage = document.createElement("button");
  nextPage.id = "nextPage";
  nextPage.textContent = "Next";

  paginationWrapper.append(prevPage, pageInfo, nextPage);
  app.appendChild(paginationWrapper);
}

// Hent data
export async function fetchListings() {
  try {
    const response = await fetch(`${apiUrl}?_bids=true`);
    const result = await response.json();
    allListings = result.data;
    applyFilters();
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}

// Filtrering og sortering
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const sortBy = document.getElementById("sortSelect").value;

  // Filtrer annonser basert på søk (alle annonser vises, men vi sorterer de aktive først)
  filteredListings = allListings.filter((listing) =>
    listing.title.toLowerCase().includes(searchTerm)
  );

  // Sorter annonser slik at de som er aktive (første bud kan legges) vises først
  filteredListings.sort((a, b) => {
    const isAActive = new Date(a.endsAt) > new Date(); // Sjekker om annonse a er aktiv
    const isBActive = new Date(b.endsAt) > new Date(); // Sjekker om annonse b er aktiv

    // De som er aktive skal vises først
    if (isAActive && !isBActive) return -1; // a er aktiv, b er ikke
    if (!isAActive && isBActive) return 1; // b er aktiv, a er ikke

    // Hvis begge er aktive eller begge er inaktive, sorter etter valgt kriterium
    const aBid = a.bids?.length ? Math.max(...a.bids.map((b) => b.amount)) : 0;
    const bBid = b.bids?.length ? Math.max(...b.bids.map((b) => b.amount)) : 0;

    switch (sortBy) {
      case "newest":
        return new Date(b.created) - new Date(a.created); // Nyeste først
      case "oldest":
        return new Date(a.created) - new Date(b.created); // Eldste først
      case "mostBids":
        return (b.bids?.length || 0) - (a.bids?.length || 0); // Mest bud
      case "fewestBids":
        return (a.bids?.length || 0) - (b.bids?.length || 0); // Færrest bud
      case "highestBid":
        return bBid - aBid; // Høyeste bud først
      case "lowestBid":
        return aBid - bBid; // Laveste bud først
      default:
        return 0; // Ingen sortering
    }
  });

  displayListings();
}

// Vis annonser
function displayListings() {
  const listingsContainer = document.getElementById("listings");
  listingsContainer.innerHTML = "";

  const start = (currentPage - 1) * listingsPerPage;
  const end = start + listingsPerPage;
  const listingsToShow = filteredListings.slice(start, end);

  if (listingsToShow.length === 0) {
    const noResults = document.createElement("p");
    noResults.textContent = "Ingen treff.";
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

    const endTime = document.createElement("div");
    endTime.classList.add("text-gray-300", "mb-4");
    endTime.innerHTML = `<strong>Ends:</strong> ${new Date(
      listing.endsAt
    ).toLocaleString()}`;

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
    bidButton.textContent = "Bid on Listing";
    bidButton.classList.add(
      "bg-blue-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "mt-4",
      "w-full"
    );
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

    card.append(
      img,
      title,
      description,
      endTime,
      bidDisplay,
      bidButton,
      infoButton
    );
    listingsContainer.appendChild(card); // fjernet <a>-lenken
  });

  updatePagination();
}

// Budgivning
async function placeBid(id) {
  if (!id) return alert("No listing ID provided.");

  const bidAmount = prompt("Enter your bid amount:");
  if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
    return alert("Please enter a valid bid amount.");
  }

  const token = getAccessToken();
  if (!token) return alert("You are not authenticated.");

  // Logg bidAmount for å se hva som sendes
  console.log("Placing bid for listing:", id);
  console.log("Bid amount:", bidAmount);

  try {
    const response = await fetch(`${apiUrl}/${id}/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify({ amount: parseFloat(bidAmount) }),
    });

    const result = await response.json();

    // Logg resultatet fra API-et
    console.log("API Response:", result);

    if (response.ok) {
      alert("Your bid has been placed successfully.");
    } else {
      throw new Error(result.message || "Unknown error.");
    }
  } catch (error) {
    alert("Failed to place bid: " + error.message);
    console.error("Error placing bid:", error);
  }
}

// Paginering
function updatePagination() {
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  pageInfo.textContent = `Side ${currentPage} av ${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  buildUI();
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
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayListings();
    }
  });

  fetchListings();
});
