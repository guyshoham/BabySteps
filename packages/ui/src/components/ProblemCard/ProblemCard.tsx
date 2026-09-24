import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { Card } from '../Card/Card';

export interface ProblemCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  icon?: IconName;
  /** Used instead of icon when set. */
  emoji?: string;
  title: ReactNode;
  text?: ReactNode;
}

export function ProblemCard({ icon, emoji, title, text, className, ...rest }: ProblemCardProps) {
  return (
    <Card as="article" padding="lg" hoverLift className={cx('bs-problem-card', className)} {...rest}>
      {(emoji || icon) && (
        <span className="bs-problem-card__icon" aria-hidden="true">
          {emoji ?? (icon && <Icon name={icon} size={28} />)}
        </span>
      )}
      <h3 className="bs-problem-card__title">{title}</h3>
      {text && <p className="bs-problem-card__text">{text}</p>}
    </Card>
  );
}
