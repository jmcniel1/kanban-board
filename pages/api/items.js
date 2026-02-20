import { fetchGmailItems } from "../../lib/gmail.js";
import { fetchSlackItems } from "../../lib/slack.js";
import { fetchAsanaItems } from "../../lib/asana.js";
import { prioritizeItems } from "../../lib/prioritize.js";

// ── Demo items shown when no API keys are configured ────────────────────────
const DEMO_ITEMS = [
  {
    id: "demo-1", source: "gmail", column: "today", priority: "urgent",
    title: "Q1 Board Deck — final review needed by EOD",
    from: "Sarah Chen", fromRole: "Head of Strategy",
    snippet: "Hey — attached is the final Q1 deck. Can you review slides 8-14 (revenue forecasts) before I send to the board tonight? A few numbers changed after yesterday's call.",
    aiReason: "Deadline today, senior stakeholder, action required",
    tags: ["review", "deadline"], time: "9:12 AM", url: null,
  },
  {
    id: "demo-2", source: "slack", column: "today", priority: "high",
    title: "Prod deploy blocked — need your approval on the PR",
    from: "Marcus Rivera", fromRole: "Engineering",
    snippet: "The auth-service PR has been approved by 2 reviewers but needs your sign-off as code owner. Deploy queue is backing up — 3 PRs waiting behind it.",
    aiReason: "Blocking other engineers, code-owner approval needed",
    tags: ["deploy", "blocking"], time: "10:34 AM", url: null,
  },
  {
    id: "demo-3", source: "asana", column: "today", priority: "high",
    title: "Finalize vendor contract — legal review complete",
    from: "Priya Patel", fromRole: "Operations",
    snippet: "Legal signed off on the Datadog contract with minor redlines. Need your budget approval so we can execute before the discount expires Friday.",
    aiReason: "Budget approval required, time-sensitive discount",
    tags: ["contract", "approval"], time: "8:45 AM", url: null,
  },
  {
    id: "demo-4", source: "gmail", column: "week", priority: "medium",
    title: "Interview panel for Senior PM candidate — Thursday",
    from: "Jordan Lee", fromRole: "Recruiting",
    snippet: "You're on the panel for Aisha Thompson (Senior PM). Interview is Thursday 2pm. Attached is her resume and the question rubric. Let me know if the time works.",
    aiReason: "Scheduled for Thursday, prep needed",
    tags: ["hiring", "interview"], time: "Yesterday", url: null,
  },
  {
    id: "demo-5", source: "slack", column: "week", priority: "medium",
    title: "Design review: new onboarding flow mockups",
    from: "Ava Nguyen", fromRole: "Design",
    snippet: "Posted the updated onboarding mockups in #design-reviews. Would love your input on the activation step — we simplified it based on last sprint's feedback.",
    aiReason: "Cross-team review, impacts next sprint",
    tags: ["design", "review"], time: "Yesterday", url: null,
  },
  {
    id: "demo-6", source: "asana", column: "week", priority: "medium",
    title: "Write eng blog post on migration to Edge Functions",
    from: "DevRel Team", fromRole: "Marketing",
    snippet: "Draft due next Monday. Outline approved — just need the technical write-up covering latency wins and the rollback strategy. ~1500 words.",
    aiReason: "Due next Monday, outline already approved",
    tags: ["writing", "blog"], time: "3 days ago", url: null,
  },
  {
    id: "demo-7", source: "gmail", column: "fyi", priority: "low",
    title: "All-hands recording + slides posted",
    from: "Emily Park", fromRole: "Chief of Staff",
    snippet: "If you missed today's all-hands, the recording and slides are in the shared drive. Key topics: Q2 OKRs, new PTO policy, and the office move timeline.",
    aiReason: "Informational, no action needed",
    tags: ["all-hands", "info"], time: "2:00 PM", url: null,
  },
  {
    id: "demo-8", source: "slack", column: "fyi", priority: "low",
    title: "New Figma component library is live",
    from: "Design Systems", fromRole: "#design-systems",
    snippet: "v2.4 of the component library just shipped. Includes updated button variants, new toast component, and dark mode tokens. Migration guide in the thread.",
    aiReason: "Useful reference, no immediate action",
    tags: ["design-system", "update"], time: "11:20 AM", url: null,
  },
  {
    id: "demo-9", source: "asana", column: "blocked", priority: "blocked",
    title: "API rate-limit proposal — waiting on platform team",
    from: "You", fromRole: "Assigned to you",
    snippet: "Rate limiting RFC is drafted and submitted. Waiting for platform team review and load test results before we can proceed to implementation.",
    aiReason: "Blocked on platform team review",
    tags: ["rfc", "waiting"], time: "5 days ago", url: null,
  },
  {
    id: "demo-10", source: "gmail", column: "blocked", priority: "blocked",
    title: "SOC 2 evidence collection — waiting on IT",
    from: "Compliance Team", fromRole: "Security",
    snippet: "We need access logs from the production environment for the SOC 2 audit. IT is pulling the exports — should have them by end of week.",
    aiReason: "Dependent on IT, no action until delivered",
    tags: ["compliance", "audit"], time: "2 days ago", url: null,
  },
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── In development, return demo data instantly (no API calls, no cost) ─────
  if (process.env.NODE_ENV !== "production") {
    return res.status(200).json({
      items:    DEMO_ITEMS,
      total:    DEMO_ITEMS.length,
      syncedAt: new Date().toISOString(),
      sources: {
        gmail: { status: "fulfilled", count: 4, error: null },
        slack: { status: "fulfilled", count: 3, error: null },
        asana: { status: "fulfilled", count: 3, error: null },
      },
    });
  }

  // ── Production: fetch from all sources in parallel ─────────────────────────
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
