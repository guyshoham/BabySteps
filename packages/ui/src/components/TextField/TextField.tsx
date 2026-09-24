import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  type?: 'text' | 'email' | 'password' | 'tel';
  hint?: ReactNode;
  /** Shows the message in red and sets aria-invalid. */
  error?: ReactNode;
}

const LTR_TYPES = new Set(['email', 'password', 'tel']);

export function TextField({
  label,
  type = 'text',
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedByIds =
    [describedBy, hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('bs-text-field', error ? 'bs-text-field--error' : null, className)}>
      <label htmlFor={inputId} className="bs-text-field__label">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        type={type}
        dir={LTR_TYPES.has(type) ? 'ltr' : undefined}
        className="bs-text-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByIds}
      />
      {hint && (
        <p id={hintId} className="bs-text-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="bs-text-field__error">
          <Icon name="close" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
