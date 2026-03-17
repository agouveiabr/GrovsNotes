export interface ParsedSearch {
  text: string;
  filters: {
    type?: string;
    project?: string;
    tag?: string;
  };
}

export function parseSearch(query: string): ParsedSearch {
  const filters: ParsedSearch["filters"] = {};

  // Extract filter patterns: type:X, project:X, tag:X
  const filterPattern = /\b(type|project|tag):(\S+)/g;

  let match: RegExpExecArray | null;
  while ((match = filterPattern.exec(query)) !== null) {
    const key = match[1] as keyof ParsedSearch["filters"];
    filters[key] = match[2];
  }

  // Remove filter patterns from the query to get the text portion
  const text = query
    .replace(filterPattern, "")
    .replace(/\s+/g, " ")
    .trim();

  return { text, filters };
}
