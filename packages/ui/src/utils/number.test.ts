import { describe, expect, it } from 'vitest';
import { clamp, clampPercent } from './number';

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(3, 0, 5)).toBe(3);
  });
  it('clamps values outside the range', () => {
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(9, 0, 5)).toBe(5);
  });
  it('treats non-finite values as the minimum', () => {
    expect(clamp(Number.NaN, 0, 5)).toBe(0);
    expect(clamp(Number.POSITIVE_INFINITY, 0, 5)).toBe(0);
  });
});

describe('clampPercent', () => {
  it('rounds and clamps to 0..100', () => {
    expect(clampPercent(42.6)).toBe(43);
    expect(clampPercent(140)).toBe(100);
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(Number.NaN)).toBe(0);
  });
});
