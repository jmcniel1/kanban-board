/**
 * Run this ONCE to get your Gmail refresh token:
 *   node scripts/get-gmail-token.js
 *
 * Then copy the refresh token into your .env.local as GOOGLE_REFRESH_TOKEN.
 * You never need to run this again — the refresh token works indefinitely.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import http from "http";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });
import { google } from "googleapis";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "\n❌ Missing env vars. Create a .env.local with:\n" +
    "   GOOGLE_CLIENT_ID=...\n" +
    "   GOOGLE_CLIENT_SECRET=...\n"
  );
  process.exit(1);
}

const PORT = 4242;
const REDIRECT_URI = `http://localhost:${PORT}`;

const auth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const url = auth.generateAuthUrl({
  access_type: "offline",
  prompt:      "consent",
  scope:       ["https://www.googleapis.com/auth/gmail.readonly"],
});

console.log("\n1. Open this URL in your browser:\n");
console.log("   " + url);
console.log("\n2. Sign in and allow access — you'll be redirected back automatically.\n");

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, REDIRECT_URI).searchParams.get("code");
  if (!code) { res.end("No code found."); return; }
  res.end("<h1>✅ Auth complete! You can close this tab.</h1>");
  server.close();
  try {
    const { tokens } = await auth.getToken(code);
    console.log("\n✅ Success! Add this to your .env.local:\n");
    console.log(`   GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\nDone.\n");
  } catch (err) {
    console.error("\n❌ Token exchange failed:", err.message);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`⏳ Listening on http://localhost:${PORT} for the OAuth callback...`);
});
