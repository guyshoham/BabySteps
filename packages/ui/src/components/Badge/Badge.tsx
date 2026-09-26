import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** tag: white label (hero tags). pill: mint status. highlight: brown "most popular". */
  variant?: 'tag' | 'pill' | 'highlight';
  icon?: IconName;
}

export function Badge({ variant = 'tag', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('bs-badge', `bs-badge--${variant}`, className)} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
