/** Clamps a number into [min, max]. Non-finite input returns min. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Rounds and clamps a percent into 0..100. */
export function clampPercent(value: number): number {
  return Math.round(clamp(value, 0, 100));
}
