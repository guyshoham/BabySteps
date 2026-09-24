import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('announces the rating', () => {
    render(<StarRating value={4} />);
    expect(screen.getByRole('img', { name: 'דירוג 4 מתוך 5' })).toBeInTheDocument();
  });

  it('clamps values above 5 and below 0', () => {
    const { rerender } = render(<StarRating value={7} />);
    expect(screen.getByRole('img', { name: 'דירוג 5 מתוך 5' })).toBeInTheDocument();
    rerender(<StarRating value={-2} />);
    expect(screen.getByRole('img', { name: 'דירוג 0 מתוך 5' })).toBeInTheDocument();
  });

  it('fills the right number of stars', () => {
    const { container } = render(<StarRating value={3.4} />);
    expect(container.querySelectorAll('.bs-stars__on')).toHaveLength(3);
    expect(container.querySelectorAll('.bs-stars__off')).toHaveLength(2);
  });
});
