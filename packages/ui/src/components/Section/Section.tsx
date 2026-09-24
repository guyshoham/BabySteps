import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { toneClass, type SectionTone } from '../../utils/tone';
import { Container, type ContainerWidth } from '../Container/Container';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color. cocoa also switches text to white. */
  tone?: SectionTone;
  /** Vertical space. */
  padding?: 'sm' | 'md' | 'lg';
  /** Inner container width, or "none" to manage layout yourself. */
  width?: ContainerWidth | 'none';
}

export function Section({ tone = 'white', padding = 'md', width = 'base', className, children, ...rest }: SectionProps) {
  return (
    <section className={cx('bs-section', toneClass(tone), `bs-section--${padding}`, className)} {...rest}>
      {width === 'none' ? children : <Container width={width}>{children}</Container>}
    </section>
  );
}
