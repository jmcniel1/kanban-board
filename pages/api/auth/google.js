import { google } from "googleapis";

// Kicks off the Google OAuth flow — visit /api/auth/google in your browser
export default function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/google-callback"
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",          // forces Google to return a refresh token every time
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });

  res.redirect(url);
}
