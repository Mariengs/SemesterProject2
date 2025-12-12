/**
 * Create profile banner element
 * @param {string} bannerUrl - The banner image URL
 * @returns {HTMLElement} The banner element
 */
export function createProfileBanner(bannerUrl) {
  const banner = document.createElement("div");
  banner.className = "w-full h-48 bg-gray-700 rounded-t-2xl overflow-hidden";

  if (bannerUrl) {
    const bannerImg = document.createElement("img");
    bannerImg.src = bannerUrl;
    bannerImg.alt = "Profile banner";
    bannerImg.className = "w-full h-full object-cover";
    banner.appendChild(bannerImg);
  }

  return banner;
}

/**
 * Create profile avatar element
 * @param {string} avatarUrl - The avatar image URL
 * @param {string} name - The user's name
 * @returns {HTMLElement} The avatar element
 */
export function createProfileAvatar(avatarUrl, name) {
  const avatarContainer = document.createElement("div");
  avatarContainer.className = "flex justify-center -mt-16 mb-4";

  const avatar = document.createElement("img");
  avatar.src = avatarUrl || "https://via.placeholder.com/150";
  avatar.alt = `${name}'s avatar`;
  avatar.className =
    "w-32 h-32 rounded-full border-4 border-gray-800 object-cover";

  avatarContainer.appendChild(avatar);
  return avatarContainer;
}

/**
 * Create profile info section
 * @param {Object} profile - The profile data
 * @returns {HTMLElement} The profile info element
 */
export function createProfileInfo(profile) {
  const infoSection = document.createElement("div");
  infoSection.className = "text-center mb-6";

  // Name
  const name = document.createElement("h1");
  name.className = "text-3xl font-bold text-white mb-2";
  name.textContent = profile.name;

  // Bio
  const bio = document.createElement("p");
  bio.className = "text-gray-400 mb-4";
  bio.textContent = profile.bio || "No bio provided";

  // Stats
  const stats = document.createElement("div");
  stats.className = "flex justify-center gap-6 text-sm text-gray-300";

  const credits = document.createElement("div");
  credits.innerHTML = `<span class="font-semibold">Credits:</span> ${
    profile.credits || 0
  } kr`;

  const listings = document.createElement("div");
  listings.innerHTML = `<span class="font-semibold">Listings:</span> ${
    profile._count?.listings || 0
  }`;

  const wins = document.createElement("div");
  wins.innerHTML = `<span class="font-semibold">Wins:</span> ${
    profile._count?.wins || 0
  }`;

  stats.append(credits, listings, wins);
  infoSection.append(name, bio, stats);

  return infoSection;
}

/**
 * Create a listing card
 * @param {Object} listing - The listing data
 * @param {boolean} isOwner - Whether current user owns this listing
 * @param {Function} onEdit - Callback for edit button
 * @param {Function} onDelete - Callback for delete button
 * @param {Function} onView - Callback for view button
 * @returns {HTMLElement} The listing card element
 */
export function createListingCard(listing, isOwner, onEdit, onDelete, onView) {
  const card = document.createElement("div");
  card.className =
    "bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-xl transition";

  // Image
  if (listing.media?.[0]?.url) {
    const img = document.createElement("img");
    img.src = listing.media[0].url;
    img.alt = listing.title;
    img.className = "w-full h-40 object-cover rounded-md mb-3";
    card.appendChild(img);
  }

  // Title
  const title = document.createElement("h3");
  title.className = "text-lg font-semibold text-white mb-2";
  title.textContent = listing.title;

  // Description
  const description = document.createElement("p");
  description.className = "text-gray-400 text-sm mb-3 line-clamp-2";
  description.textContent = listing.description || "No description";

  // Bids count
  const bidsCount = document.createElement("p");
  bidsCount.className = "text-gray-300 text-sm mb-3";
  bidsCount.innerHTML = `<span class="font-semibold">Bids:</span> ${
    listing._count?.bids || 0
  }`;

  card.append(title, description, bidsCount);

  // Buttons - CREATE ONCE ONLY
  const btnWrapper = document.createElement("div");
  btnWrapper.className = "flex gap-2 mt-4";

  // View button - always show
  const viewBtn = document.createElement("button");
  viewBtn.textContent = "View";
  viewBtn.className = "btn-view-listing";
  viewBtn.addEventListener("click", () => onView(listing.id));
  btnWrapper.appendChild(viewBtn);

  // Edit and Delete buttons - only if owner
  if (isOwner) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-edit";
    editBtn.addEventListener("click", () => onEdit(listing.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-delete";
    deleteBtn.addEventListener("click", () => onDelete(listing.id));

    btnWrapper.append(editBtn, deleteBtn);
  }

  card.appendChild(btnWrapper); // Append buttons ONCE

  return card;
}

/**
 * Create action buttons for profile (Edit Profile, Logout, etc.)
 * @param {boolean} isOwnProfile - Whether viewing own profile
 * @param {Function} onEditProfile - Callback for edit profile button
 * @param {Function} onCreateListing - Callback for create listing button
 * @returns {HTMLElement} The action buttons container
 */
export function createProfileActionButtons(
  isOwnProfile,
  onEditProfile,
  onCreateListing
) {
  const btnContainer = document.createElement("div");
  btnContainer.className = "flex gap-3 justify-center mt-6";

  if (isOwnProfile) {
    const editProfileBtn = document.createElement("button");
    editProfileBtn.textContent = "Edit Profile";
    editProfileBtn.className =
      "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition";
    editProfileBtn.addEventListener("click", onEditProfile);

    const createListingBtn = document.createElement("button");
    createListingBtn.textContent = "Create Listing";
    createListingBtn.className =
      "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold transition";
    createListingBtn.addEventListener("click", onCreateListing);

    btnContainer.append(editProfileBtn, createListingBtn);
  }

  return btnContainer;
}

/**
 * Render listings grid
 * @param {Array} listings - Array of listing objects
 * @param {HTMLElement} container - The container element
 * @param {boolean} isOwner - Whether current user owns these listings
 * @param {Object} callbacks - Object with onEdit, onDelete, onView callbacks
 */
export function renderListings(listings, container, isOwner, callbacks) {
  container.innerHTML = "";

  if (listings.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "text-gray-400 text-center col-span-full py-8";
    emptyMessage.textContent = "No listings yet";
    container.appendChild(emptyMessage);
    return;
  }

  listings.forEach((listing) => {
    const card = createListingCard(
      listing,
      isOwner,
      callbacks.onEdit,
      callbacks.onDelete,
      callbacks.onView
    );
    container.appendChild(card);
  });
}

/**
 * Create complete profile card
 * @param {Object} profile - The profile data
 * @param {boolean} isOwnProfile - Whether viewing own profile
 * @param {Object} callbacks - Object with callback functions
 * @returns {HTMLElement} The complete profile card
 */
export function createProfileCard(profile, isOwnProfile, callbacks) {
  const card = document.createElement("section");
  card.className = "bg-gray-800 rounded-2xl shadow-lg mb-6";

  const banner = createProfileBanner(profile.banner?.url);
  const avatar = createProfileAvatar(profile.avatar?.url, profile.name);
  const info = createProfileInfo(profile);
  const actionButtons = createProfileActionButtons(
    isOwnProfile,
    callbacks.onEditProfile,
    callbacks.onCreateListing
  );

  card.append(banner, avatar, info, actionButtons);

  return card;
}
