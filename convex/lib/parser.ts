import * as chrono from "chrono-node";

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
  let project = parts[1] || undefined;
  let cleanTitle = parts[2] || "";
  let datePart = parts[3] || "";

  // Handle cases with fewer than 4 parts
  if (parts.length === 1) {
    // If only one part, it's the title
    cleanTitle = parts[0];
    rawType = "todo"; // Default type
  } else if (parts.length === 2) {
    // Type - Title
    rawType = parts[0].toLowerCase();
    cleanTitle = parts[1];
  } else if (parts.length === 3) {
    // Type - Project - Title
    rawType = parts[0].toLowerCase();
    project = parts[1];
    cleanTitle = parts[2];
  }

  // Semantic mapping
  const type = TYPE_MAPPING[rawType] || (rawType as ItemType) || "task";

  // Date parsing
  let dueAt: number | undefined = undefined;

  // Rule PARSER-03: 'log' auto-date
  if (type === "note" && rawType === "log" && !datePart) {
    dueAt = context.now;
  } else if (datePart) {
    const referenceDate = new Date(context.now);
    const parsedDate = chrono.parseDate(datePart, {
      instant: referenceDate,
      timezoneOffset: context.timezoneOffset,
    });
    if (parsedDate) {
      dueAt = parsedDate.getTime();
    }
  }

  return {
    type,
    project: project || undefined,
    cleanTitle,
    dueAt,
    originalInput: input,
  };
}
