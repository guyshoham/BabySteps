import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Badge } from '../Badge/Badge';

export interface FeatureStep {
  title: ReactNode;
  text?: ReactNode;
  /** Optional highlight badge, e.g. "הכי שווה". */
  badge?: ReactNode;
}

export interface FeatureStepsProps extends HTMLAttributes<HTMLOListElement> {
  steps: FeatureStep[];
}

export function FeatureSteps({ steps, className, ...rest }: FeatureStepsProps) {
  if (steps.length === 0) return null;
  return (
    <ol className={cx('bs-feature-steps', className)} {...rest}>
      {steps.map((step, i) => (
        <li key={i} className="bs-feature-steps__item">
          <span className="bs-feature-steps__num" aria-hidden="true">{i + 1}</span>
          <div className="bs-feature-steps__body">
            <h3 className="bs-feature-steps__title">
              {step.title}
              {step.badge && <Badge variant="highlight">{step.badge}</Badge>}
            </h3>
            {step.text && <p className="bs-feature-steps__text">{step.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
