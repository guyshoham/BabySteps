import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass } from '../../utils/tone';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';
import type { BoxTone } from '../HighlightBox/HighlightBox';

export interface CourseCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  image?: string;
  imageAlt?: string;
  /** Shown when there is no image. Default "🍼". */
  emoji?: string;
  /** Background of the image area. */
  tone?: BoxTone;
  /** Short facts, e.g. ["10 סרטונים", "ליווי בווטסאפ"]. */
  meta?: ReactNode[];
  price?: ReactNode;
  /** Badge over the image, e.g. "זמין עכשיו" or "בקרוב". */
  status?: ReactNode;
  /** Muted and not clickable. */
  comingSoon?: boolean;
  /** Usually a Button. */
  cta?: ReactNode;
}

export function CourseCard({
  title,
  description,
  image,
  imageAlt,
  emoji = '🍼',
  tone = 'peach',
  meta = [],
  price,
  status,
  comingSoon = false,
  cta,
  className,
  ...rest
}: CourseCardProps) {
  return (
    <Card
      as="article"
      padding="none"
      hoverLift={!comingSoon}
      className={cx('bs-course-card', comingSoon && 'bs-course-card--soon', className)}
      {...rest}
    >
      <div className={cx('bs-course-card__media', toneClass(tone))}>
        {image ? (
          <img className="bs-course-card__img" src={image} alt={imageAlt ?? ''} />
        ) : (
          <span className="bs-course-card__emoji" aria-hidden="true">{emoji}</span>
        )}
        {status && <Badge variant="pill" className="bs-course-card__status">{status}</Badge>}
      </div>
      <div className="bs-course-card__body">
        <h3 className="bs-course-card__title">{title}</h3>
        {description && <p className="bs-course-card__desc">{description}</p>}
        {meta.length > 0 && (
          <ul className="bs-course-card__meta">
            {meta.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        {(price || (cta && !comingSoon)) && (
          <div className="bs-course-card__footer">
            {price && <span className="bs-course-card__price">{price}</span>}
            {!comingSoon && cta}
          </div>
        )}
      </div>
    </Card>
  );
}
