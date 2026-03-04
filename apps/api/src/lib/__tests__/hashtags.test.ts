import { describe, it, expect } from 'vitest';
import { parseHashtags } from '../hashtags.js';

describe('parseHashtags', () => {
  it('extracts hashtags and returns clean title', () => {
    const result = parseHashtags('fix auth bug #urgent #backend');
    expect(result).toEqual({
      cleanTitle: 'fix auth bug',
      tags: ['urgent', 'backend'],
    });
  });

  it('returns empty tags when no hashtags', () => {
    const result = parseHashtags('just a normal title');
    expect(result).toEqual({
      cleanTitle: 'just a normal title',
      tags: [],
    });
  });

  it('lowercases tags', () => {
    const result = parseHashtags('something #Frontend #API');
    expect(result).toEqual({
      cleanTitle: 'something',
      tags: ['frontend', 'api'],
    });
  });

  it('deduplicates tags', () => {
    const result = parseHashtags('thing #api #api #Api');
    expect(result).toEqual({
      cleanTitle: 'thing',
      tags: ['api'],
    });
  });

  it('handles hashtags at beginning and middle', () => {
    const result = parseHashtags('#idea build a #cool thing');
    expect(result).toEqual({
      cleanTitle: 'build a thing',
      tags: ['idea', 'cool'],
    });
  });

  it('trims extra whitespace', () => {
    const result = parseHashtags('  hello   #tag   world  ');
    expect(result).toEqual({
      cleanTitle: 'hello world',
      tags: ['tag'],
    });
  });

  it('handles empty string', () => {
    const result = parseHashtags('');
    expect(result).toEqual({
      cleanTitle: '',
      tags: [],
    });
  });

  it('handles only hashtags', () => {
    const result = parseHashtags('#tag1 #tag2');
    expect(result).toEqual({
      cleanTitle: '',
      tags: ['tag1', 'tag2'],
    });
  });
});
