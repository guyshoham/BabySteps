import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small label above the title. */
  eyebrow?: ReactNode;
  /** Wrap words in <em> for a terracotta highlight. */
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'start';
  level?: 1 | 2 | 3;
}

export function SectionHeading({ eyebrow, title, lead, align = 'center', level = 2, className, ...rest }: SectionHeadingProps) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <div className={cx('bs-section-heading', `bs-section-heading--${align}`, className)} {...rest}>
      {eyebrow && <p className="bs-section-heading__eyebrow">{eyebrow}</p>}
      <Heading className="bs-section-heading__title">{title}</Heading>
      {lead && <p className="bs-section-heading__lead">{lead}</p>}
    </div>
  );
}
