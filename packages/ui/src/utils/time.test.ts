import { describe, expect, it } from 'vitest';
import { formatDuration } from './time';

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(0)).toBe('0:00');
  });
  it('formats hours', () => {
    expect(formatDuration(3725)).toBe('1:02:05');
  });
  it('rounds fractional seconds', () => {
    expect(formatDuration(59.6)).toBe('1:00');
  });
  it('returns null for missing or invalid input', () => {
    expect(formatDuration(undefined)).toBeNull();
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(-3)).toBeNull();
    expect(formatDuration(Number.NaN)).toBeNull();
  });
});
