import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface CredentialPillProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: IconName;
}

export function CredentialPill({ icon = 'check', className, children, ...rest }: CredentialPillProps) {
  return (
    <span className={cx('bs-credential-pill', className)} {...rest}>
      <span className="bs-credential-pill__icon">
        <Icon name={icon} size={14} />
      </span>
      {children}
    </span>
  );
}
