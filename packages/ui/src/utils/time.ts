/** Formats seconds as m:ss or h:mm:ss. Returns null for missing or invalid input. */
export function formatDuration(sec?: number | null): string | null {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return null;
  const total = Math.round(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
