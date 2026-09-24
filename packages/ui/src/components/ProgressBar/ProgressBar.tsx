import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { clampPercent } from '../../utils/number';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 0 to 100. Clamped; invalid values show 0. */
  value: number;
  label?: ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, showValue = true, size = 'md', className, ...rest }: ProgressBarProps) {
  const labelId = useId();
  const pct = clampPercent(value);
  return (
    <div className={cx('bs-progress', `bs-progress--${size}`, className)} {...rest}>
      {(label || showValue) && (
        <div className="bs-progress__top">
          {label && <span id={labelId}>{label}</span>}
          {showValue && <span className="bs-progress__value">{pct}%</span>}
        </div>
      )}
      <div
        className="bs-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : `${pct}%`}
      >
        <span className="bs-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
