# What changed & what you still need to do

## Code changes made
- `backend/src/main/resources/application.properties`: DB URL/username/password,
  Gmail username/password, Google OAuth client ID, and JWT secret are now read
  from environment variables (`${DB_URL}`, `${DB_PASSWORD}`, `${JWT_SECRET}`,
  etc.) instead of being hardcoded.
- `backend/src/main/java/com/sportsems/security/JwtUtil.java`: the JWT signing
  key now comes from the `jwt.secret` property (backed by `JWT_SECRET`) instead
  of a hardcoded constant.
- Added `backend/.env.example` — documents every environment variable Render
  needs. Spring Boot doesn't read `.env` files directly; you set these in
  Render's dashboard under your service's **Environment** tab.
- Added `backend/.gitignore` so build output and any local secrets file don't
  get committed again.

## You still need to do this (I can't do it for you)

1. **Rotate every credential that was previously hardcoded** — they were
   committed to your GitHub repo, so treat them as compromised even if the
   repo is private:
   - Aiven MySQL `avnadmin` password (reset it from the Aiven console)
   - Gmail App Password (revoke the old one, generate a new one)
   - JWT secret (any random 32+ char string, e.g. `openssl rand -base64 48`)

2. **Set the environment variables on Render** (Dashboard → your backend
   service → Environment): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
   `MAIL_USERNAME`, `MAIL_PASSWORD`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`.
   Use the new rotated values, not the old ones.

3. **Set `VITE_API_URL` on Vercel** (Project → Settings → Environment
   Variables) to your Render backend's URL, e.g.
   `https://sports-ems-backend.onrender.com`. Then trigger a redeploy —
   Vite only reads this at build time, so it won't take effect otherwise.
   This is what's causing the "Failed to fetch" error on the Events page.

4. **Authorize your Vercel domain in Google Cloud Console** (APIs & Services
   → Credentials → your OAuth Client → Authorized JavaScript origins). Add
   your deployed Vercel URL alongside `http://localhost:5173`. This fixes
   the "Google sign-in failed" error in production.

5. **Check Render's logs** for the register/"Server Error" issue after doing
   the above — if it persists, it's likely the backend still can't reach
   Aiven (e.g. an IP allowlist on the Aiven side), and the logs will show
   the exact exception.
