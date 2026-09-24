import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackLink } from './BackLink';

describe('BackLink', () => {
  it('renders a link with the href and label', () => {
    render(<BackLink href="/app/my-courses">הקורסים שלי</BackLink>);
    const link = screen.getByRole('link', { name: 'הקורסים שלי' });
    expect(link).toHaveAttribute('href', '/app/my-courses');
    expect(link).toHaveClass('bs-back-link');
  });

  it('puts a hidden arrow before the label', () => {
    render(<BackLink href="/app/course/rolling">חזרה לקורס</BackLink>);
    const link = screen.getByRole('link', { name: 'חזרה לקורס' });
    const icon = link.firstElementChild;
    expect(icon?.tagName.toLowerCase()).toBe('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(link.lastElementChild).toHaveTextContent('חזרה לקורס');
  });

  it('keeps an extra className', () => {
    render(<BackLink href="/" className="extra">חזרה</BackLink>);
    expect(screen.getByRole('link')).toHaveClass('bs-back-link', 'extra');
  });
});
