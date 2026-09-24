import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { clamp } from '../../utils/number';
import { Icon } from '../Icon/Icon';

export interface StarRatingProps extends HTMLAttributes<HTMLSpanElement> {
  /** 0 to 5. Rounded to a whole star and clamped. */
  value: number;
  size?: number;
  /** Overrides the default "דירוג X מתוך 5". */
  label?: string;
}

export function StarRating({ value, size = 18, label, className, ...rest }: StarRatingProps) {
  const stars = Math.round(clamp(value, 0, 5));
  return (
    <span role="img" aria-label={label ?? `דירוג ${stars} מתוך 5`} className={cx('bs-stars', className)} {...rest}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} className={i < stars ? 'bs-stars__on' : 'bs-stars__off'} />
      ))}
    </span>
  );
}
