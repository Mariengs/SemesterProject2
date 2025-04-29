const apiUrl = "https://v2.api.noroff.dev/auction/listings?_bids=true";

export function buildUI() {
  const app = document.getElementById("app");

  // Søkeinput
  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("id", "searchInput");
  searchInput.setAttribute("placeholder", "Search by title...");
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

  // Sorteringsvalg
  const sortSelect = document.createElement("select");
  sortSelect.setAttribute("id", "sortSelect");
  sortSelect.classList.add(
    "bg-gray-700",
    "text-white",
    "rounded-md",
    "p-2",
    "mb-4",
    "w-full",
    "sm:w-auto"
  );

  // Sorteringsalternativer
  const sortOption1 = document.createElement("option");
  sortOption1.value = "end";
  sortOption1.textContent = "Sort after end date";
  sortSelect.appendChild(sortOption1);

  const sortOption2 = document.createElement("option");
  sortOption2.value = "bid";
  sortOption2.textContent = "Sort after highest bid";
  sortSelect.appendChild(sortOption2);

  app.appendChild(sortSelect);

  // Listings container
  const listingsContainer = document.createElement("div");
  listingsContainer.setAttribute("id", "listings");
  listingsContainer.classList.add(
    "grid",
    "grid-cols-1",
    "sm:grid-cols-2",
    "lg:grid-cols-3",
    "gap-6"
  );
  app.appendChild(listingsContainer);

  // Paginering
  const paginationWrapper = document.createElement("div");
  paginationWrapper.setAttribute("id", "pagination");

  const prevPage = document.createElement("button");
  prevPage.setAttribute("id", "prevPage");
  prevPage.textContent = "Previous";

  const pageInfo = document.createElement("span");
  pageInfo.setAttribute("id", "pageInfo");
  pageInfo.style.margin = "0 10px";

  const nextPage = document.createElement("button");
  nextPage.setAttribute("id", "nextPage");
  nextPage.textContent = "Next";

  paginationWrapper.appendChild(prevPage);
  paginationWrapper.appendChild(pageInfo);
  paginationWrapper.appendChild(nextPage);

  app.appendChild(paginationWrapper);
}

export let allListings = [];
export let filteredListings = [];
let currentPage = 1;
const listingsPerPage = 21;

async function fetchListings() {
  try {
    const response = await fetch(apiUrl);
    const result = await response.json();
    allListings = result.data; // Henter annonser fra API
    applyFilters();
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}

function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const searchTerm = searchInput.value.toLowerCase();
  const sortBy = sortSelect.value;

  filteredListings = allListings
    .filter((listing) => listing.title.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      if (sortBy === "bid") {
        const aBid = a.bids?.length
          ? Math.max(...a.bids.map((b) => b.amount))
          : 0;
        const bBid = b.bids?.length
          ? Math.max(...b.bids.map((b) => b.amount))
          : 0;
        return bBid - aBid;
      } else {
        return new Date(a.endsAt) - new Date(b.endsAt);
      }
    });

  displayListings();
}

export function displayListings() {
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
    const linkWrapper = document.createElement("a");
    linkWrapper.setAttribute(
      "href",
      `/html/single-listing.html?id=${listing.id}`
    );
    linkWrapper.classList.add("block", "hover:no-underline");

    const listingElement = document.createElement("div");
    listingElement.classList.add(
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
      listing.media && listing.media.length > 0
        ? listing.media[0].url
        : "https://via.placeholder.com/300x200?text=Ingen+bilde";
    const imageAlt =
      listing.media && listing.media.length > 0
        ? listing.media[0].alt
        : "Placeholder-image";

    const img = document.createElement("img");
    img.setAttribute(
      "src",
      "https://via.placeholder.com/300x200?text=Lasting..."
    );
    img.setAttribute("alt", imageAlt);
    img.classList.add("w-full", "h-48", "object-cover", "rounded-md", "mb-4");
    img.setAttribute("loading", "lazy");
    img.setAttribute("src", imageUrl);

    listingElement.appendChild(img);

    const title = document.createElement("h3");
    title.classList.add("text-xl", "font-semibold", "text-gray-200", "mb-2");
    title.textContent = listing.title;
    listingElement.appendChild(title);

    const description = document.createElement("p");
    description.classList.add("text-gray-400", "mb-4");
    description.textContent = listing.description || "No description.";
    listingElement.appendChild(description);

    const endTime = document.createElement("div");
    endTime.classList.add("text-gray-300", "mb-4");

    const endTimeStrong = document.createElement("strong");
    endTimeStrong.textContent = "Ends: ";
    endTime.appendChild(endTimeStrong);
    endTime.appendChild(
      document.createTextNode(new Date(listing.endsAt).toLocaleString())
    );
    listingElement.appendChild(endTime);

    const highestBid = listing.bids?.length
      ? Math.max(...listing.bids.map((b) => b.amount))
      : 0;

    const bidAmount = document.createElement("div");
    bidAmount.classList.add(
      "text-xl",
      "font-semibold",
      "text-gray-200",
      "mb-2"
    );

    const bidAmountStrong = document.createElement("strong");
    bidAmountStrong.textContent = "Highest bid: ";
    bidAmount.appendChild(bidAmountStrong);
    bidAmount.appendChild(document.createTextNode(`${highestBid} kr`));
    listingElement.appendChild(bidAmount);

    // Legge til "By på annonse"-knapp
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
    bidButton.addEventListener("click", () => placeBid(listing.id));

    listingElement.appendChild(bidButton);

    // Legge til "More Info"-knapp
    const moreInfoButton = document.createElement("button");
    moreInfoButton.textContent = "More Info";
    moreInfoButton.classList.add(
      "bg-gray-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "mt-4",
      "w-full"
    );
    moreInfoButton.addEventListener("click", () => {
      window.location.href = `/html/single-listing.html?id=${listing.id}`;
    });

    listingElement.appendChild(moreInfoButton);

    linkWrapper.appendChild(listingElement);
    listingsContainer.appendChild(linkWrapper);
  });

  updatePagination();
}
import { getAccessToken } from "../api/auth.js";
const id = new URLSearchParams(window.location.search).get("id");

async function placeBid(id) {
  if (!id) {
    console.error("No listing ID provided.");
    alert("No listing ID provided.");
    return;
  }

  const bidAmount = prompt("Enter your bid amount:");

  if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
    alert("Please enter a valid bid amount.");
    return;
  }

  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/auction/listings/${id}/bids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`, // Sørg for at denne funksjonen returnerer riktig token
        },
        body: JSON.stringify({
          amount: parseFloat(bidAmount),
        }),
      }
    );

    if (response.ok) {
      alert("Your bid has been placed successfully.");
      // fetchListings(); // Oppdater annonsene etter budet, hvis nødvendig
    } else {
      const errorData = await response.json(); // Henter feilresponsen fra API-et
      console.error("API Error:", errorData);
      alert("Failed to place bid. Reason: " + errorData.message); // Vist spesifikk feilmelding
    }
  } catch (error) {
    console.error("Error placing bid:", error);
    alert("An error occurred while placing your bid.");
  }
}

function updatePagination() {
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  pageInfo.textContent = `Side ${currentPage} av ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

document.addEventListener("DOMContentLoaded", () => {
  buildUI();
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
  });

  sortSelect.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });

  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayListings();
    }
  });

  nextPageButton.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayListings();
    }
  });

  fetchListings();
});
