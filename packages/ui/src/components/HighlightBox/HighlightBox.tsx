import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass } from '../../utils/tone';
import { Icon, type IconName } from '../Icon/Icon';

export type BoxTone = 'peach' | 'mint' | 'sky' | 'blush';

export interface HighlightBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: BoxTone;
  title?: ReactNode;
  icon?: IconName;
}

export function HighlightBox({ tone = 'mint', title, icon, className, children, ...rest }: HighlightBoxProps) {
  return (
    <div className={cx('bs-highlight-box', toneClass(tone), className)} {...rest}>
      {icon && (
        <span className="bs-highlight-box__icon" aria-hidden="true">
          <Icon name={icon} size={24} />
        </span>
      )}
      <div className="bs-highlight-box__content">
        {title && <p className="bs-highlight-box__title">{title}</p>}
        {children && <div className="bs-highlight-box__body">{children}</div>}
      </div>
    </div>
  );
}
