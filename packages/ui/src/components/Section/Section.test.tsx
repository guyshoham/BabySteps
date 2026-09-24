import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('applies the tone class and wraps children in a container', () => {
    const { container } = render(<Section tone="mint" id="about">תוכן</Section>);
    const section = container.querySelector('section')!;
    expect(section).toHaveAttribute('id', 'about');
    expect(section).toHaveClass('bs-section', 'bs-tone--mint', 'bs-section--md');
    expect(section.querySelector('.bs-container--base')).toHaveTextContent('תוכן');
  });

  it('skips the container with width="none"', () => {
    const { container } = render(<Section width="none">תוכן</Section>);
    expect(container.querySelector('.bs-container')).toBeNull();
  });
});
