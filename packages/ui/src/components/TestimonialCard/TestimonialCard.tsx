import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Avatar } from '../Avatar/Avatar';
import { StarRating } from '../StarRating/StarRating';
import { Card } from '../Card/Card';

export interface TestimonialCardProps extends HTMLAttributes<HTMLElement> {
  quote: ReactNode;
  name: string;
  /** Short context, e.g. "אמא של אמירי, 5 חודשים". */
  detail?: ReactNode;
  /** Photo URL. Initials are shown without it. */
  avatar?: string;
  /** 0 to 5. null hides the stars. */
  rating?: number | null;
}

export function TestimonialCard({ quote, name, detail, avatar, rating = 5, className, ...rest }: TestimonialCardProps) {
  return (
    <Card as="figure" padding="lg" className={cx('bs-testimonial', className)} {...rest}>
      {rating != null && <StarRating value={rating} size={18} />}
      <blockquote className="bs-testimonial__quote">{quote}</blockquote>
      <figcaption className="bs-testimonial__author">
        <Avatar name={name} src={avatar} size="sm" decorative />
        <span className="bs-testimonial__who">
          <strong className="bs-testimonial__name">{name}</strong>
          {detail && <span className="bs-testimonial__detail">{detail}</span>}
        </span>
      </figcaption>
    </Card>
  );
}
