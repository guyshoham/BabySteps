import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface StickyCTAProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Usually a small Button. */
  action: ReactNode;
  /**
   * fixed: bottom bar on phones only (hidden from 768px up). Give the page
   * padding-block-end of about 96px so the bar does not cover content.
   * static: renders in place (previews, docs).
   */
  position?: 'fixed' | 'static';
}

export function StickyCTA({ title, subtitle, action, position = 'fixed', className, ...rest }: StickyCTAProps) {
  return (
    <div className={cx('bs-sticky-cta', `bs-sticky-cta--${position}`, className)} {...rest}>
      <div className="bs-sticky-cta__text">
        <strong className="bs-sticky-cta__title">{title}</strong>
        {subtitle && <span className="bs-sticky-cta__subtitle">{subtitle}</span>}
      </div>
      <div className="bs-sticky-cta__action">{action}</div>
    </div>
  );
}
