import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { clampPercent } from '../../utils/number';
import { Icon } from '../Icon/Icon';
import { Badge } from '../Badge/Badge';
import { ProgressBar } from '../ProgressBar/ProgressBar';

export interface CourseProgressCardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  title: ReactNode;
  image?: string;
  lessonsDone: number;
  lessonsTotal: number;
  /** Overrides the percent computed from lessons. */
  progress?: number;
  href: string;
  /** Overrides the automatic "start / continue / watch again" label. */
  ctaLabel?: ReactNode;
}

function safeCount(n: number): number {
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function CourseProgressCard({
  title,
  image,
  lessonsDone,
  lessonsTotal,
  progress,
  href,
  ctaLabel,
  className,
  ...rest
}: CourseProgressCardProps) {
  const total = safeCount(lessonsTotal);
  const done = Math.min(safeCount(lessonsDone), total);
  const pct = clampPercent(progress ?? (total > 0 ? (done / total) * 100 : 0));
  const label = ctaLabel ?? (pct >= 100 ? 'לצפייה חוזרת' : pct > 0 ? 'להמשך צפייה' : 'להתחלת הקורס');

  return (
    <a href={href} className={cx('bs-course-progress', className)} {...rest}>
      <div className="bs-course-progress__media">
        {image ? (
          <img className="bs-course-progress__img" src={image} alt="" />
        ) : (
          <span className="bs-course-progress__emoji" aria-hidden="true">🍼</span>
        )}
        {pct >= 100 && (
          <Badge variant="pill" icon="check" className="bs-course-progress__done">
            הושלם
          </Badge>
        )}
      </div>
      <div className="bs-course-progress__body">
        <h3 className="bs-course-progress__title">{title}</h3>
        <ProgressBar value={pct} label={`${done} מתוך ${total} שיעורים`} />
        <span className="bs-course-progress__cta">
          {label}
          <Icon name="arrow" size={18} />
        </span>
      </div>
    </a>
  );
}
