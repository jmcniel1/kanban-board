import { google } from "googleapis";
import { formatRelativeDate } from "./utils.js";

// ── OAuth client ──────────────────────────────────────────────────────────────
function getAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google-callback"
  );
  // Refresh token is obtained once via scripts/get-gmail-token.js and stored in env
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

// ── Fetch unread/important emails from the last 2 days ───────────────────────
export async function fetchGmailItems() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("Gmail not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN");
  }

  const auth  = getAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  // Pull unread, non-promotional emails from the last 2 days
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread newer_than:2d -category:promotions -category:social -label:automated",
    maxResults: 25,
  });

  const msgIds = listRes.data.messages || [];
  if (!msgIds.length) return [];

  // Fetch metadata for each in parallel (metadata only = fast)
  const details = await Promise.all(
    msgIds.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      })
    )
  );

  return details.map((res) => {
    const msg     = res.data;
    const headers = msg.payload?.headers || [];
    const get     = (name) => headers.find((h) => h.name === name)?.value || "";

    const subject  = get("Subject") || "(no subject)";
    const rawFrom  = get("From");
    const date     = get("Date");

    // Parse "Display Name <email@example.com>" → "Display Name"
    const fromName = rawFrom.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim() || rawFrom;

    return {
      id:        `gmail_${msg.id}`,
      source:    "gmail",
      title:     subject,
      snippet:   msg.snippet || "",
      from:      fromName,
      fromRole:  "Email",
      time:      date ? formatRelativeDate(new Date(date)) : "Unknown",
      rawDate:   date ? new Date(date).toISOString() : null,
      isUnread:  msg.labelIds?.includes("UNREAD") ?? true,
      isStarred: msg.labelIds?.includes("STARRED") ?? false,
      threadId:  msg.threadId,
      url:       `https://mail.google.com/mail/u/0/#inbox/${msg.threadId}`,
    };
  });
}

// ── One-time OAuth URL generator (called by scripts/get-gmail-token.js) ───────
export function getAuthUrl() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob" // out-of-band: shows code in browser
  );
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });
}

export async function exchangeCodeForTokens(code) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob"
  );
  const { tokens } = await auth.getToken(code);
  return tokens;
}
