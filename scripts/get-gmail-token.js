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
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });
import { google } from "googleapis";
import readline from "readline";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "\n❌ Missing env vars. Create a .env.local with:\n" +
    "   GOOGLE_CLIENT_ID=...\n" +
    "   GOOGLE_CLIENT_SECRET=...\n"
  );
  process.exit(1);
}

const auth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "urn:ietf:wg:oauth:2.0:oob"   // shows auth code in browser instead of redirecting
);

const url = auth.generateAuthUrl({
  access_type: "offline",
  prompt:      "consent",
  scope:       ["https://www.googleapis.com/auth/gmail.readonly"],
});

console.log("\n1. Open this URL in your browser:\n");
console.log("   " + url);
console.log("\n2. Sign in with your Google account and click Allow.");
console.log("3. Copy the authorization code shown on the page.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste the authorization code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await auth.getToken(code.trim());
    console.log("\n✅ Success! Add this to your .env.local:\n");
    console.log(`   GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\nDone. You can delete this script after saving the token.\n");
  } catch (err) {
    console.error("\n❌ Token exchange failed:", err.message);
    process.exit(1);
  }
});
