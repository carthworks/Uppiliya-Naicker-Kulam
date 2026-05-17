# Uppiliya Naicker Kulam Directory

A modern, responsive, and visually rich web application built to serve the **Uppiliya Naicker Community**. It helps community members discover their Kulatheivam (family deity) locations, identify their specific Kulam/Pattam categories, and understand their "Pangali" (lineage) and "Maman Machan" (in-law) relationships.

## ✨ Features

- **Smart Search & Auto-complete**: Fuzzy search functionality allowing users to find their category by searching for their Kulam, specific Temple Name, Location, or Relationship.
- **Interactive Google Maps**: Automatically extracts temple locations and embeds a dynamic Google Map inline. Users can click on specific temples to instantly update the map or open the location directly in the Google Maps App.
- **Visual Relationship Graph**: Dynamically maps and visualizes community connections. Generates an interactive "Pangali Network Tree" highlighting how the user's selected Kulam connects to others.
- **Enriched WhatsApp Sharing**: A built-in "Share via WhatsApp" button that generates a beautifully formatted Tamil message. It includes direct Google Map links for all their Kulatheivam temples and appends creator branding.
- **Modern Glassmorphism UI**: High-end visual aesthetics using Vanilla CSS. Features dark-mode gradients, blur backdrops, modern typography, and smooth micro-animations.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: React 18
- **Styling**: Vanilla CSS (`globals.css`) with Glassmorphism principles
- **Icons**: Inline SVGs
- **Data**: Parsed localized JSON (`data.json`) generated from Markdown

## 🚀 Getting Started

To run the application locally on your machine:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the App:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/layout.jsx`: The global HTML layout structure.
- `app/page.jsx`: The main client-side application interface handling state, search, mapping, and sharing.
- `app/globals.css`: The comprehensive design system containing all styling, animations, and CSS variables.
- `data.json`: The core dataset encompassing 64 Kulam records, categorized into பட்டக்காரர்கள், மந்திரிகள், நாட்டார்கள், and சேர்வைக்காரர்கள், along with their temple lists and relationships.

## 👨‍💻 Created By

**T. Karthikeyan**
- 🌐 **Portfolio**: [carthworks.vercel.app](https://carthworks.vercel.app/)
- 📞 **Phone**: +91 94867 72206
- ✉️ **Email**: tkarthikeyan@gmail.com

---
*© 2026 Uppiliya Naicker Community Portal. All rights reserved.*
