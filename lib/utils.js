// ── Date helpers ──────────────────────────────────────────────────────────────

export function formatRelativeDate(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1)   return "Just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)   return `${diffDays} days ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDueDate(dateStr) {
  if (!dateStr) return "No due date";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d - today) / 86400000);

  if (diff < 0)  return `Overdue (${Math.abs(diff)}d)`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 7)  return `Due ${d.toLocaleDateString("en-US", { weekday: "short" })}`;
  return `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr.startsWith(today);
}
