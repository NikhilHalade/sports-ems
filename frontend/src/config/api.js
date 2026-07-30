// Single source of truth for the backend's base URL.
//
// Locally: falls back to http://localhost:8080 so `npm run dev` keeps working
// with no setup.
//
// Deployed (Vercel, Netlify, etc.): set an environment variable named
// VITE_API_URL to your backend's real URL, e.g.
//   VITE_API_URL=https://sports-ems-backend.onrender.com
// Vite only reads env vars at BUILD time, so after adding/changing it in your
// host's dashboard you must trigger a new deploy for it to take effect.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
