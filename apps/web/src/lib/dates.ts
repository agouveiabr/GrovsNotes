/**
 * Date utilities for due date handling.
 * All timestamps are midnight local time of the date in question.
 */

export function todayMidnightLocal(): number {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function tomorrowMidnightLocal(): number {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isOverdue(dueAt: number | null | undefined): boolean {
  if (!dueAt) return false;
  return dueAt < todayMidnightLocal();
}

export function isDueToday(dueAt: number | null | undefined): boolean {
  if (!dueAt) return false;
  return dueAt === todayMidnightLocal();
}

export function formatDueDate(dueAt: number): string {
  if (!dueAt) return "";

  const today = todayMidnightLocal();
  const tomorrow = tomorrowMidnightLocal();

  if (isOverdue(dueAt)) {
    return "Overdue";
  }

  if (dueAt === today) {
    return "Today";
  }

  if (dueAt === tomorrow) {
    return "Tomorrow";
  }

  // Format as "Mar 20"
  const date = new Date(dueAt);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

export function dateInputToTimestamp(value: string): number {
  // value is "YYYY-MM-DD" from HTML date input
  if (!value) return 0;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function timestampToDateInput(ts: number): string {
  // Convert timestamp to "YYYY-MM-DD"
  if (!ts) return "";
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
