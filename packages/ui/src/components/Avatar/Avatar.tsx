import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

/** First letter of the first two words. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('');
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Hide from screen readers when the name is shown next to it. */
  decorative?: boolean;
}

export function Avatar({ name, src, size = 'md', decorative = false, className, ...rest }: AvatarProps) {
  return (
    <span
      className={cx('bs-avatar', `bs-avatar--${size}`, className)}
      aria-hidden={decorative || undefined}
      {...rest}
    >
      {src ? (
        <img className="bs-avatar__img" src={src} alt={decorative ? '' : name} />
      ) : (
        <>
          <span className="bs-avatar__initials" aria-hidden="true">{initials(name)}</span>
          {!decorative && <span className="bs-visually-hidden">{name}</span>}
        </>
      )}
    </span>
  );
}
