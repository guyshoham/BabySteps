import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass, type SectionTone } from '../../utils/tone';
import { Badge } from '../Badge/Badge';
import { Container } from '../Container/Container';

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Small white label above the title. */
  tag?: ReactNode;
  /** The page h1. Wrap words in <em> for a terracotta highlight. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Usually one or two Buttons. */
  actions?: ReactNode;
  /** Short line under the actions, e.g. "ליווי אישי בווטסאפ". Only true claims. */
  proof?: ReactNode;
  /** Image or VideoFrame. Switches to a two-column layout on desktop. */
  media?: ReactNode;
  tone?: SectionTone;
}

export function Hero({ tag, title, subtitle, actions, proof, media, tone = 'peach', className, ...rest }: HeroProps) {
  return (
    <section className={cx('bs-hero', toneClass(tone), media ? 'bs-hero--split' : 'bs-hero--center', className)} {...rest}>
      <div className="bs-hero__shapes" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <Container width="wide" className="bs-hero__inner">
        <div className="bs-hero__content">
          {tag && <Badge variant="tag">{tag}</Badge>}
          <h1 className="bs-hero__title">{title}</h1>
          {subtitle && <p className="bs-hero__subtitle">{subtitle}</p>}
          {actions && <div className="bs-hero__actions">{actions}</div>}
          {proof && <div className="bs-hero__proof">{proof}</div>}
        </div>
        {media && <div className="bs-hero__media">{media}</div>}
      </Container>
    </section>
  );
}
