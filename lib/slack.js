import { WebClient } from "@slack/web-api";
import { formatRelativeDate } from "./utils.js";

// ── Fetch recent @mentions and DMs ────────────────────────────────────────────
export async function fetchSlackItems() {
  if (!process.env.SLACK_TOKEN) {
    throw new Error("Slack not configured — set SLACK_TOKEN");
  }

  const client = new WebClient(process.env.SLACK_TOKEN);

  // Who am I?
  const authInfo = await client.auth.test();
  const myUserId = authInfo.user_id;

  const yesterday = Math.floor((Date.now() - 2 * 86400000) / 1000).toString();
  const items = [];

  // ── 1. Channels: scan for @mentions in the last 48h ──────────────────────
  const channelListRes = await client.conversations.list({
    types: "public_channel,private_channel",
    exclude_archived: true,
    limit: 200,
  });

  const myChannels = (channelListRes.channels || [])
    .filter((c) => c.is_member)
    .slice(0, 20); // cap at 20 to stay within rate limits

  for (const channel of myChannels) {
    let history;
    try {
      history = await client.conversations.history({
        channel: channel.id,
        oldest: yesterday,
        limit: 100,
      });
    } catch {
      continue; // no access / archived
    }

    const mentions = (history.messages || []).filter(
      (msg) =>
        msg.type === "message" &&
        !msg.subtype &&
        (msg.text?.includes(`<@${myUserId}>`) ||
          msg.text?.includes("<!channel>") ||
          msg.text?.includes("<!here>"))
    );

    for (const msg of mentions) {
      let senderName = msg.username || "Unknown";
      if (msg.user) {
        try {
          const userInfo = await client.users.info({ user: msg.user });
          senderName = userInfo.user?.real_name || userInfo.user?.name || senderName;
        } catch {}
      }

      const cleanText = msg.text
        ?.replace(/<@[UW][A-Z0-9]+>/g, "@someone")
        .replace(/<!channel>/g, "@channel")
        .replace(/<!here>/g, "@here")
        .trim() || "";

      items.push({
        id:         `slack_${channel.id}_${msg.ts}`,
        source:     "slack",
        title:      `#${channel.name} · ${cleanText.slice(0, 60)}${cleanText.length > 60 ? "…" : ""}`,
        snippet:    cleanText,
        from:       senderName,
        fromRole:   "Channel",
        time:       formatRelativeDate(new Date(parseFloat(msg.ts) * 1000)),
        rawDate:    new Date(parseFloat(msg.ts) * 1000).toISOString(),
        channelName: channel.name,
        url:        `https://slack.com/app_redirect?channel=${channel.id}`,
      });
    }
  }

  // ── 2. DMs: surface recent unread direct messages ─────────────────────────
  const dmListRes = await client.conversations.list({
    types: "im",
    exclude_archived: true,
    limit: 30,
  });

  for (const dm of (dmListRes.channels || [])) {
    if (!dm.unread_count) continue; // skip if no unread

    let history;
    try {
      history = await client.conversations.history({
        channel: dm.id,
        oldest: yesterday,
        limit: 3,
      });
    } catch {
      continue;
    }

    const messages = (history.messages || []).filter(
      (m) => m.type === "message" && !m.subtype && m.user !== myUserId
    );
    if (!messages.length) continue;

    let senderName = "DM";
    try {
      const userInfo = await client.users.info({ user: dm.user });
      senderName = userInfo.user?.real_name || userInfo.user?.name || "DM";
    } catch {}

    const latest = messages[0];
    const cleanText = latest.text?.trim() || "";

    items.push({
      id:       `slack_dm_${dm.id}_${latest.ts}`,
      source:   "slack",
      title:    `DM from ${senderName}`,
      snippet:  cleanText,
      from:     senderName,
      fromRole: "Direct Message",
      time:     formatRelativeDate(new Date(parseFloat(latest.ts) * 1000)),
      rawDate:  new Date(parseFloat(latest.ts) * 1000).toISOString(),
      url:      `https://slack.com/app_redirect?channel=${dm.id}`,
    });
  }

  // Most recent first, cap at 20 total Slack items
  return items
    .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
    .slice(0, 20);
}
