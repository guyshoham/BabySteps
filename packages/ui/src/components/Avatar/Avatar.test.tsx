import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, initials } from './Avatar';

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('ירדן שוהם')).toBe('יש');
    expect(initials('כרמל')).toBe('כ');
    expect(initials('  טל   בן  דוד ')).toBe('טב');
  });
  it('returns an empty string for a blank name', () => {
    expect(initials('   ')).toBe('');
  });
});

describe('Avatar', () => {
  it('shows a photo with the name as alt text', () => {
    render(<Avatar name="ירדן שוהם" src="/about.jpg" />);
    expect(screen.getByRole('img', { name: 'ירדן שוהם' })).toHaveAttribute('src', '/about.jpg');
  });

  it('falls back to initials without a photo, and keeps the name for screen readers', () => {
    const { container } = render(<Avatar name="ירדן שוהם" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('יש');
    expect(screen.getByText('ירדן שוהם')).toHaveClass('bs-visually-hidden');
  });

  it('is fully hidden when decorative', () => {
    const { container } = render(<Avatar name="טל" decorative />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
