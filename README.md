# Semester Project 2 – Front-End Auction House

<img src="/Skjermbilde 2025-05-13 kl. 13.32.25.png"  width="200"/>

## Table of Contents

1. [Project Overview](#project-overview)
2. [Time Commitment](#time-commitment)
3. [Features & User Requirements](#features--user-requirements)
4. [Design & UX Expectations](#design--ux-expectations)
5. [Technical Requirements](#technical-requirements)
6. [API Documentation](#api-documentation)
7. [Getting Started](#getting-started)
8. [Folder Structure](#folder-structure)
9. [Scripts](#scripts)

---

## Project Overview

Welcome to **Semester Project 2**, a real-world assignment where you’ll build a front-end application for an online auction API. Your goal is to deliver a polished, interactive user experience supporting user registration, listing items, bidding, and profile management. You may work alone or in a team, and you must plan, develop, and document a solution that meets the needs of your target users.

---

## Time Commitment

- **Full-Time:** 6 weeks

---

## Features & User Requirements

### Authentication & Profiles

- **Register** & **Log In** (only `@stud.noroff.no` emails allowed).
- **Secure sessions**, with user credits visible on every page when logged in.
- **Edit Profile:** update bio, avatar & banner.
- **Credit Balance:** displayed in the account dashboard and header/nav.

### Listings Management

- **Create Listing:** title, deadline date, media gallery (images), description.
- **Edit Listing:** inline edit form for your own listings.
- **Delete Listing:** with user confirmation.

### Bidding System

- **Place Bids** on other users’ listings.
- **Bid History:** display a chronological list of bids per listing.
- **Highest Bid Indicator** and real-time countdown timer.

### Browsing & Search (Public)

- **Browse All Listings** without logging in.
- **Search & Filter** by keyword, category, or other attributes.
- **Responsive Grid** layout for listing cards.

---

## Design & UX Expectations

- **Modern, Clean & Responsive** UI on mobile, tablet & desktop.
- **Intuitive Navigation:** clear header, footer, and section flows.
- **Accessibility:** WCAG-friendly contrast, keyboard nav, ARIA labels.
- **High-Fidelity Prototype** in your design tool (Figma, Sketch, etc.) covering
  - Desktop & mobile screens
  - Clickable “happy-path” interactions
  - Final colors & optimized images

---

## Technical Requirements

- **Frameworks/Libraries:** use vanilla JS
- **CSS:** Tailwind CSS (v3+), PostCSS, Autoprefixer.
- **Build Tool:** Vite.
- **State Management & Routing:** as needed (e.g. localStorage for auth).
- **Error Handling:** clear UI feedback on API errors, form validation.
- **Version Control:** Git & GitHub, with clean commit history and meaningful messages.

---

## API Documentation

- **Noroff API v2:** https://docs.noroff.dev/docs/v2
- **Auction House Listings:** https://docs.noroff.dev/docs/v2/auction-house/listings
- **Auth (Register/Login):** https://docs.noroff.dev/docs/v2/auth/register

_All endpoints require `X-Noroff-API-Key` and Bearer token where appropriate._

---

## Getting Started

1. **Clone repository**

   ```bash
   git clone https://github.com/Mariengs/SemesterProject2.git
   cd SemesterProject2

   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start development server

   ```bash
   npm run dev
   ```

4. Watch Tailwind CSS (in a separate terminal)

   ```bash
   npm run watch:css
   ```

5. Build for production

   ```bash
   npm run build
   ```

6. Preview production build
   ```bash
   npm run preview
   ```

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start Vite dev server            |
| `npm run watch:css` | Rebuild Tailwind on changes      |
| `npm run build`     | Build production bundle & CSS    |
| `npm run preview`   | Preview production build locally |
