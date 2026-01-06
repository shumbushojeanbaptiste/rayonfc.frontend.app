# OleePlay — Media Streaming Frontend (React + Vite + Tailwind) 🎬 🎵

**OleePlay** is a lightweight, responsive frontend for streaming and selling media — videos, films, and songs. Built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**, it's focused on fast playback, secure purchase flow, and an accessible, mobile-first UI.

## Quick Start

**Prerequisites:** Node.js >= 14 and npm (or yarn).

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the built app:

```bash
npm run preview
```

Open the app at `http://localhost:5173`.

## Environment

Create an `.env.local` (or `.env`) and set Vite variables using the `VITE_` prefix. Common variables used by this frontend:

```
VITE_API_BASE_URL=https://api.example.com
VITE_STRIPE_KEY=pk_live_xxx
VITE_CDN_URL=https://cdn.example.com
```

These point the app to streaming endpoints, payment backend, and CDN assets.

## Features

- Video & audio playback (HTML5 player) with controls and captions
- Media catalog, search, filters, and categories
- Purchase flow & payment integration (`src/services/payment.service.ts`)
- Playlists / Favorites and user profiles
- Responsive, accessible UI and dark mode support
- Fast dev feedback via Vite HMR

## Project layout (short)

- `public/` — static assets, demo `data.json`
- `src/components/` — reusable UI components (player, cards, modals)
- `src/pages/` — route pages (Home, Videos, Profile, Purchases)
- `src/services/` — API & payment integration
- `src/lib/` — helpers and API wrappers

## Development notes

- Scripts: `dev`, `build`, `preview` (see `package.json`)
- Prettier is installed (see `devDependencies`)
- For adaptive streaming (HLS/DASH) consider adding `hls.js` if needed

---

## Changelog

See git history for project-specific changelogs and releases.




