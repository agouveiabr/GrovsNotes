export interface ParsedHashtags {
  cleanTitle: string;
  tags: string[];
}

export function parseHashtags(input: string): ParsedHashtags {
  const tagPattern = /#(\w+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(input)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  const cleanTitle = input
    .replace(tagPattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  const uniqueTags = [...new Set(tags)];

  return { cleanTitle, tags: uniqueTags };
}
