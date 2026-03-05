import { describe, it, expect } from 'vitest';
import { parseSearch } from '../search-parser.js';

describe('parseSearch', () => {
  it('parses plain text', () => {
    const result = parseSearch('elo ranking system');
    expect(result.text).toBe('elo ranking system');
    expect(result.filters).toEqual({});
  });

  it('parses type filter', () => {
    const result = parseSearch('type:idea');
    expect(result.text).toBe('');
    expect(result.filters.type).toBe('idea');
  });

  it('parses project filter', () => {
    const result = parseSearch('project:ATP');
    expect(result.text).toBe('');
    expect(result.filters.project).toBe('ATP');
  });

  it('parses tag filter', () => {
    const result = parseSearch('tag:urgent');
    expect(result.text).toBe('');
    expect(result.filters.tag).toBe('urgent');
  });

  it('parses mixed text and filters', () => {
    const result = parseSearch('elo ranking type:idea project:ATP tag:urgent');
    expect(result.text).toBe('elo ranking');
    expect(result.filters.type).toBe('idea');
    expect(result.filters.project).toBe('ATP');
    expect(result.filters.tag).toBe('urgent');
  });

  it('handles empty string', () => {
    const result = parseSearch('');
    expect(result.text).toBe('');
    expect(result.filters).toEqual({});
  });

  it('handles filters in the middle of text', () => {
    const result = parseSearch('find type:bug login issues');
    expect(result.text).toBe('find login issues');
    expect(result.filters.type).toBe('bug');
  });
});
