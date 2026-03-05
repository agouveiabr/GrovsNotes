export interface ParsedSearch {
  text: string;
  filters: {
    type?: string;
    project?: string;
    tag?: string;
  };
}

/**
 * Parses a search query string like "elo ranking type:idea project:ATP tag:urgent"
 * Extracts type:X, project:X, tag:X patterns as filters.
 * Remaining text is the FTS search term.
 */
export function parseSearch(query: string): ParsedSearch {
  const filters: ParsedSearch['filters'] = {};

  // Extract filter patterns: type:X, project:X, tag:X
  // Supports both quoted and unquoted values
  const filterPattern = /\b(type|project|tag):(\S+)/g;

  let match: RegExpExecArray | null;
  while ((match = filterPattern.exec(query)) !== null) {
    const key = match[1] as keyof ParsedSearch['filters'];
    filters[key] = match[2];
  }

  // Remove filter patterns from the query to get the text portion
  const text = query
    .replace(filterPattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, filters };
}
