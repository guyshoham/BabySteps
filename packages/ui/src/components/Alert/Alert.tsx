import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<AlertVariant, IconName> = {
  success: 'check',
  error: 'close',
  warning: 'clock',
  info: 'sparkle',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
}

export function Alert({ variant = 'info', title, className, children, ...rest }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx('bs-alert', `bs-alert--${variant}`, className)}
      {...rest}
    >
      <span className="bs-alert__icon" aria-hidden="true">
        <Icon name={ICONS[variant]} size={16} />
      </span>
      <div className="bs-alert__content">
        {title && <p className="bs-alert__title">{title}</p>}
        {children && <div className="bs-alert__body">{children}</div>}
      </div>
    </div>
  );
}
