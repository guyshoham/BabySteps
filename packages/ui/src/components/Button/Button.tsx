import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  /** Shows a spinner, blocks clicks and sets aria-busy. */
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** Renders an <a> instead of a <button>. */
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition,
  fullWidth = false,
  loading = false,
  type = 'button',
  href,
  target,
  rel,
  disabled,
  onClick,
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconName = icon ?? (variant === 'whatsapp' ? 'whatsapp' : undefined);
  const position = iconPosition ?? (variant === 'whatsapp' ? 'start' : 'end');
  const iconSize = size === 'sm' ? 16 : 20;
  const iconEl = iconName ? <Icon name={iconName} size={iconSize} className="bs-button__icon" /> : null;

  const classes = cx(
    'bs-button',
    `bs-button--${variant}`,
    `bs-button--${size}`,
    fullWidth && 'bs-button--full',
    loading && 'bs-button--loading',
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size={iconSize - 2} decorative /> : position === 'start' && iconEl}
      <span className="bs-button__label">{children}</span>
      {!loading && position === 'end' && iconEl}
    </>
  );

  if (href !== undefined) {
    const blocked = loading || disabled;
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (blocked) {
        event.preventDefault();
        return;
      }
      onClick?.(event as unknown as MouseEvent<HTMLButtonElement>);
    };
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={classes}
        href={blocked ? undefined : href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        aria-busy={loading || undefined}
        aria-disabled={blocked || undefined}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
