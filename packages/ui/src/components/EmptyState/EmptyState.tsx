import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional icon shown in a soft circle above the title. */
  icon?: IconName;
  /** e.g. "עדיין אין לך קורסים". */
  title: ReactNode;
  text?: ReactNode;
  /** A Button or link. `children` works too; both render in the action row. */
  action?: ReactNode;
  headingLevel?: 'h2' | 'h3';
}

/** Shown when a list has nothing in it yet. */
export function EmptyState({
  icon,
  title,
  text,
  action,
  headingLevel: Heading = 'h2',
  className,
  children,
  ...rest
}: EmptyStateProps) {
  const hasAction = action != null || children != null;
  return (
    <div className={cx('bs-empty-state', className)} {...rest}>
      {icon && (
        <span className="bs-empty-state__icon" aria-hidden="true">
          <Icon name={icon} size={32} />
        </span>
      )}
      <Heading className="bs-empty-state__title">{title}</Heading>
      {text && <p className="bs-empty-state__text">{text}</p>}
      {hasAction && (
        <div className="bs-empty-state__action">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}
