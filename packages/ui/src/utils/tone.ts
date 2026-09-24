export type SectionTone = 'cream' | 'white' | 'peach' | 'mint' | 'sky' | 'blush' | 'cocoa';

export const sectionTones: SectionTone[] = ['cream', 'white', 'peach', 'mint', 'sky', 'blush', 'cocoa'];

/** Class that sets --bs-tone (and ink overrides for cocoa). Defined in base.css. */
export function toneClass(tone: SectionTone): string {
  return `bs-tone--${tone}`;
}

/** The surface color of a tone, for inline styles. */
export function toneVar(tone: SectionTone): string {
  return tone === 'white' ? 'var(--surface-card)' : `var(--surface-${tone})`;
}
