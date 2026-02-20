import { formatDueDate } from "./utils.js";

const ASANA_BASE = "https://app.asana.com/api/1.0";

async function asanaFetch(path, token) {
  const res = await fetch(`${ASANA_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asana API error ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Fetch tasks assigned to me, due in the next 14 days ──────────────────────
export async function fetchAsanaItems() {
  if (!process.env.ASANA_TOKEN) {
    throw new Error("Asana not configured — set ASANA_TOKEN");
  }

  const token = process.env.ASANA_TOKEN;

  // 1. Get my workspaces
  const me = await asanaFetch("/users/me?opt_fields=workspaces", token);
  const workspaces = me.data?.workspaces || [];
  if (!workspaces.length) return [];

  const workspaceGid = process.env.ASANA_WORKSPACE_GID || workspaces[0].gid;

  // 2. Fetch my open tasks, due within the next 14 days
  const twoWeeksOut = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
  const today       = new Date().toISOString().split("T")[0];

  const fields = [
    "name", "notes", "due_on", "due_at",
    "completed", "assignee_status",
    "projects.name", "projects.color",
    "memberships.section.name",
    "permalink_url", "modified_at",
    "tags.name",
  ].join(",");

  const tasks = await asanaFetch(
    `/tasks?assignee=me&workspace=${workspaceGid}&completed_since=now` +
      `&due_on.before=${twoWeeksOut}` +
      `&opt_fields=${fields}` +
      `&limit=50`,
    token
  );

  const allTasks = tasks.data || [];

  // Also fetch overdue tasks (due before today, not completed)
  const overdueTasks = await asanaFetch(
    `/tasks?assignee=me&workspace=${workspaceGid}&completed_since=now` +
      `&due_on.before=${today}` +
      `&opt_fields=${fields}` +
      `&limit=20`,
    token
  );

  // Merge + deduplicate
  const allGids = new Set();
  const merged  = [];
  for (const t of [...(overdueTasks.data || []), ...allTasks]) {
    if (!allGids.has(t.gid)) {
      allGids.add(t.gid);
      merged.push(t);
    }
  }

  return merged.map((task) => {
    const projectName   = task.projects?.[0]?.name || "No Project";
    const sectionName   = task.memberships?.[0]?.section?.name;
    const dueOn         = task.due_on;
    const isOverdue     = dueOn && dueOn < today;
    const isDueToday    = dueOn === today;
    const asanaTags     = (task.tags || []).map((t) => t.name.toLowerCase().replace(/\s+/g, "-"));

    return {
      id:          `asana_${task.gid}`,
      source:      "asana",
      title:       task.name,
      snippet:     task.notes?.trim().slice(0, 300) || "No description",
      from:        projectName,
      fromRole:    sectionName || "Project",
      time:        formatDueDate(dueOn),
      rawDate:     dueOn ? new Date(dueOn + "T12:00:00Z").toISOString() : null,
      isOverdue,
      isDueToday,
      url:         task.permalink_url,
      asanaTags,
      modifiedAt:  task.modified_at,
    };
  });
}
