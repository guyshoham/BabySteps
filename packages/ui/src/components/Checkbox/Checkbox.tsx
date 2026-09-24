import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label, e.g. "אשמח לקבל מיילים". */
  children: ReactNode;
  hint?: ReactNode;
  /** Shows the message in red and sets aria-invalid. */
  error?: ReactNode;
}

/**
 * A checkbox with a visible label. Pass `checked` + `onChange` for a controlled
 * box, or `defaultChecked` for an uncontrolled one. In RTL the box sits at the
 * inline start (right) of the label.
 */
export function Checkbox({
  children,
  hint,
  error,
  id,
  disabled,
  className,
  'aria-describedby': describedBy,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-checkbox`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedByIds =
    [describedBy, hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={cx(
        'bs-checkbox',
        error ? 'bs-checkbox--error' : null,
        disabled ? 'bs-checkbox--disabled' : null,
        className,
      )}
    >
      <label htmlFor={inputId} className="bs-checkbox__row">
        <input
          {...rest}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className="bs-checkbox__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
        />
        <span className="bs-checkbox__box" aria-hidden="true">
          <Icon name="check" size={16} className="bs-checkbox__check" />
        </span>
        <span className="bs-checkbox__label">{children}</span>
      </label>
      {hint && (
        <p id={hintId} className="bs-checkbox__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="bs-checkbox__error">
          <Icon name="close" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
