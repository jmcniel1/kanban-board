import Anthropic from "@anthropic-ai/sdk";
import { isToday } from "./utils.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Heuristic fallback (no API key) ──────────────────────────────────────────
function heuristicPrioritize(items) {
  return items.map((item) => {
    const title   = item.title?.toLowerCase() || "";
    const snippet = item.snippet?.toLowerCase() || "";
    const text    = title + " " + snippet;

    // Column
    let column = "week";
    if (item.isDueToday || item.isOverdue || isToday(item.rawDate)) {
      column = "today";
    } else if (text.match(/urgent|asap|critical|today|eod|end of day|deadline|blocking/)) {
      column = "today";
    } else if (text.match(/newsletter|digest|unsubscribe|announcement|fyi|no action/)) {
      column = "fyi";
    } else if (text.match(/waiting|blocked|pending approval|on hold/)) {
      column = "blocked";
    }

    // Priority
    let priority = "medium";
    if (text.match(/urgent|asap|critical|immediately|right away/)) {
      priority = "urgent";
    } else if (item.isDueToday || item.isOverdue) {
      priority = "high";
    } else if (column === "fyi") {
      priority = "low";
    } else if (column === "blocked") {
      priority = "blocked";
    }

    return {
      ...item,
      column,
      priority,
      aiReason:
        item.isDueToday   ? "Due today"       :
        item.isOverdue    ? "Overdue"          :
        column === "fyi"  ? "No action needed" :
        column === "blocked" ? "Waiting on others" :
                           "Heuristic estimate",
      tags: deriveTags(item),
    };
  });
}

function deriveTags(item) {
  const tags = [item.source];
  if (item.asanaTags?.length) tags.push(...item.asanaTags.slice(0, 2));
  if (item.channelName)        tags.push(item.channelName.replace(/[-_]/g, " "));
  if (item.fromRole && item.fromRole !== "Email") tags.push(item.fromRole.toLowerCase());
  return [...new Set(tags)].slice(0, 3);
}

// ── Claude AI prioritization ──────────────────────────────────────────────────
export async function prioritizeItems(items) {
  if (!items.length) return [];

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[prioritize] No ANTHROPIC_API_KEY — using heuristic fallback");
    return heuristicPrioritize(items);
  }

  // Send a compact summary of each item to Claude Haiku for speed + cost
  const summaries = items.map((item) => ({
    id:        item.id,
    source:    item.source,
    title:     item.title,
    from:      item.from,
    snippet:   item.snippet?.slice(0, 250),
    time:      item.rawDate || item.time,
    isOverdue: item.isOverdue || false,
    isDueToday: item.isDueToday || false,
    isUnread:  item.isUnread || false,
    isStarred: item.isStarred || false,
  }));

  const systemPrompt = `You are a personal productivity AI. Analyze items from a person's email, Slack, and task manager.
For each item assign:
- column: "today" | "week" | "fyi" | "blocked"
- priority: "urgent" | "high" | "medium" | "low" | "blocked"
- aiReason: 1 short phrase, max 55 chars, explaining why
- tags: array of 1-3 lowercase topic strings

Column rules:
- "today" = due today OR overdue OR from a manager/exec OR requires same-day response
- "week" = due this week, needs input, not today-critical
- "fyi" = newsletters, digests, announcements, no action needed, cc'd only
- "blocked" = explicitly waiting on someone else before you can act

Priority rules:
- "urgent" = must handle in next 2 hours
- "high" = must handle today
- "medium" = this week
- "low" = whenever, low stakes
- "blocked" = use when column is blocked

Respond ONLY with minified JSON: {"results":[{"id":"...","column":"...","priority":"...","aiReason":"...","tags":["..."]}]}`;

  let raw;
  try {
    const response = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system:     systemPrompt,
      messages: [
        {
          role:    "user",
          content: `Prioritize these ${summaries.length} items:\n${JSON.stringify(summaries)}`,
        },
      ],
    });
    raw = response.content[0].text;
  } catch (err) {
    console.error("[prioritize] Claude API error:", err.message);
    return heuristicPrioritize(items);
  }

  // Parse JSON response
  let parsed;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");
    parsed = JSON.parse(match[0]);
  } catch (err) {
    console.error("[prioritize] JSON parse error:", err.message, "\nRaw:", raw.slice(0, 300));
    return heuristicPrioritize(items);
  }

  // Merge AI results back onto original items (preserves all source metadata)
  const aiMap = Object.fromEntries((parsed.results || []).map((r) => [r.id, r]));

  return items.map((item) => {
    const ai = aiMap[item.id];
    if (!ai) {
      // Item wasn't in AI response — fall back to heuristic for this one
      return heuristicPrioritize([item])[0];
    }
    return {
      ...item,
      column:   ai.column   || "week",
      priority: ai.priority || "medium",
      aiReason: ai.aiReason || "",
      tags:     ai.tags?.length ? ai.tags : deriveTags(item),
    };
  });
}
