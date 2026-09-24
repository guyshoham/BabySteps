import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';

export type BsRootProps = HTMLAttributes<HTMLDivElement>;

/**
 * Root wrapper for every page and screen. Sets RTL, Hebrew, fonts, base text color
 * and the cream page background. Components are unstyled outside it.
 */
export function BsRoot({ className, children, ...rest }: BsRootProps) {
  return (
    <div dir="rtl" lang="he" className={cx('bs-root', className)} {...rest}>
      {children}
    </div>
  );
}
