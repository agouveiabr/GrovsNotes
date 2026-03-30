import { parseDate } from "chrono-node";

export type ItemType = "task" | "bug" | "note" | "idea" | "research";

export interface ParsedItem {
  type: ItemType;
  project?: string;
  cleanTitle: string;
  dueAt?: number;
  originalInput: string;
}

const TYPE_MAPPING: Record<string, ItemType> = {
  todo: "task",
  feat: "task",
  chore: "task",
  fix: "bug",
  log: "note",
  idea: "idea",
};

/**
 * MultiEntityParser: Parses a 4-part structure "Type - Project - Title - Date"
 */
export function parseItem(
  input: string,
  context: { now: number; timezoneOffset: number }
): ParsedItem {
  const parts = input.split(" - ").map((p) => p.trim());

  // Default values
  let rawType = parts[0]?.toLowerCase() || "";
  let project: string | undefined = parts[1];
  let cleanTitle = parts[2] || "";
  let datePart = parts[3] || "";

  // Handle cases with fewer than 4 parts
  if (parts.length === 1) {
    cleanTitle = parts[0] || "";
    rawType = "todo";
  } else if (parts.length === 2) {
    rawType = (parts[0] || "").toLowerCase();
    cleanTitle = parts[1] || "";
  } else if (parts.length === 3) {
    rawType = (parts[0] || "").toLowerCase();
    project = parts[1];
    cleanTitle = parts[2] || "";
  }

  const type = TYPE_MAPPING[rawType] || (rawType as ItemType) || "task";
  let dueAt: number | undefined = undefined;

  // Rule PARSER-03: 'log' auto-date
  if (type === "note" && rawType === "log" && !datePart) {
    dueAt = context.now;
  } else if (datePart) {
    const referenceDate = new Date(context.now);
    // chrono-node parseDate signature expects (text, ref, option)
    const parsed = parseDate(datePart, referenceDate, {
      forwardDate: true,
      timezones: {
        // We can pass timezone offsets if needed, but usually referenceDate suffices
      }
    });
    if (parsed) {
      dueAt = parsed.getTime();
    }
  }

  const result: ParsedItem = {
    type,
    cleanTitle,
    originalInput: input,
  };

  if (project !== undefined) {
    result.project = project;
  }
  if (dueAt !== undefined) {
    result.dueAt = dueAt;
  }

  return result;
}
