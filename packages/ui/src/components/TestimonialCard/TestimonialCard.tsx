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
  /** 0 to 5. Only pass a real review score. No stars show without it. */
  rating?: number;
}

export function TestimonialCard({ quote, name, detail, avatar, rating, className, ...rest }: TestimonialCardProps) {
  return (
    <Card as="figure" padding="lg" className={cx('bs-testimonial', className)} {...rest}>
      {rating !== undefined && <StarRating value={rating} size={18} />}
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
