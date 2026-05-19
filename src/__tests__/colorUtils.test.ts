import { describe, it, expect } from '@jest/globals';

const { generateColorFromId } = require('../utils/colorUtils');

describe('colorUtils', () => {
  it('returns default color for undefined or null id', () => {
    expect(generateColorFromId(undefined)).toBe('#ad6952');
    expect(generateColorFromId(null)).toBe('#ad6952');
  });

  it('generates deterministic HSL color for numeric id', () => {
    const c1 = generateColorFromId(1);
    const c2 = generateColorFromId(1);
    expect(c1).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    expect(c1).toBe(c2);
  });
});
