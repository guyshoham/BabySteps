import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface BackLinkProps {
  href: string;
  /** Link label, e.g. "חזרה לקורס". */
  children: ReactNode;
  className?: string;
}

/** A "back" link. In RTL the arrow points right and sits at the start of the text. */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <a href={href} className={cx('bs-back-link', className)}>
      <Icon name="arrow-back" size={18} />
      <span>{children}</span>
    </a>
  );
}
