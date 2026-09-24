import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'li' | 'figure';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Lifts slightly on hover. Use for clickable cards. */
  hoverLift?: boolean;
}

export function Card({ as: Tag = 'div', padding = 'md', hoverLift = false, className, ...rest }: CardProps) {
  return (
    <Tag
      className={cx('bs-card', `bs-card--pad-${padding}`, hoverLift && 'bs-card--lift', className)}
      {...rest}
    />
  );
}
