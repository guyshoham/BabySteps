import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { toneVar, type SectionTone } from '../../utils/tone';

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  variant?: 'line' | 'wave';
  /** Wave only: the tone the wave flows into (the next section). */
  tone?: SectionTone;
  /** Wave only: the tone behind the wave (the previous section). Transparent if unset. */
  from?: SectionTone;
}

export function Divider({ variant = 'line', tone = 'white', from, className, style, ...rest }: DividerProps) {
  if (variant === 'line') {
    return <hr className={cx('bs-divider', 'bs-divider--line', className)} style={style} {...rest} />;
  }
  return (
    <div
      aria-hidden="true"
      className={cx('bs-divider', 'bs-divider--wave', className)}
      style={{ color: toneVar(tone), background: from ? toneVar(from) : 'transparent', ...style }}
      {...rest}
    >
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none" focusable="false">
        <path d="M0 32C180 64 360 64 540 40S900 0 1080 16s270 40 360 32V64H0Z" fill="currentColor" />
      </svg>
    </div>
  );
}
