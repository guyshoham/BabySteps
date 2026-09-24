import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  /** Screen reader text. */
  label?: string;
  /** Hide from screen readers (use when the parent already says it is busy). */
  decorative?: boolean;
}

export function Spinner({ size = 20, label = 'טוען', decorative = false, className, style, ...rest }: SpinnerProps) {
  return (
    <span
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
      className={cx('bs-spinner', className)}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      {!decorative && <span className="bs-visually-hidden">{label}</span>}
    </span>
  );
}
