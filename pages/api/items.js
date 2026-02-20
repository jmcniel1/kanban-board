import { fetchGmailItems } from "../../lib/gmail.js";
import { fetchSlackItems } from "../../lib/slack.js";
import { fetchAsanaItems } from "../../lib/asana.js";
import { prioritizeItems } from "../../lib/prioritize.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Fetch from all sources in parallel (graceful failure per source) ────────
  const [gmailResult, slackResult, asanaResult] = await Promise.allSettled([
    fetchGmailItems(),
    fetchSlackItems(),
    fetchAsanaItems(),
  ]);

  const rawItems = [
    ...(gmailResult.status === "fulfilled" ? gmailResult.value : []),
    ...(slackResult.status === "fulfilled" ? slackResult.value : []),
    ...(asanaResult.status === "fulfilled" ? asanaResult.value : []),
  ];

  // Log any source errors (visible in Vercel function logs)
  if (gmailResult.status === "rejected") {
    console.error("[items] Gmail error:", gmailResult.reason?.message);
  }
  if (slackResult.status === "rejected") {
    console.error("[items] Slack error:", slackResult.reason?.message);
  }
  if (asanaResult.status === "rejected") {
    console.error("[items] Asana error:", asanaResult.reason?.message);
  }

  // ── AI prioritization ────────────────────────────────────────────────────────
  let prioritized = [];
  try {
    prioritized = await prioritizeItems(rawItems);
  } catch (err) {
    console.error("[items] Prioritization error:", err.message);
    // Return raw items with default values if prioritization fails
    prioritized = rawItems.map((item) => ({
      ...item,
      column:   "week",
      priority: "medium",
      aiReason: "Could not prioritize",
      tags:     [item.source],
    }));
  }

  // ── Build source status report ───────────────────────────────────────────────
  const sources = {
    gmail: {
      status:  gmailResult.status,
      count:   gmailResult.status === "fulfilled" ? gmailResult.value.length : 0,
      error:   gmailResult.status === "rejected"  ? gmailResult.reason?.message : null,
    },
    slack: {
      status:  slackResult.status,
      count:   slackResult.status === "fulfilled" ? slackResult.value.length : 0,
      error:   slackResult.status === "rejected"  ? slackResult.reason?.message : null,
    },
    asana: {
      status:  asanaResult.status,
      count:   asanaResult.status === "fulfilled" ? asanaResult.value.length : 0,
      error:   asanaResult.status === "rejected"  ? asanaResult.reason?.message : null,
    },
  };

  return res.status(200).json({
    items:    prioritized,
    total:    prioritized.length,
    syncedAt: new Date().toISOString(),
    sources,
  });
}
