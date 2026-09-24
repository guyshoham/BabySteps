import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from './TestimonialCard';

describe('TestimonialCard', () => {
  it('shows no stars when no rating is given', () => {
    const { container } = render(<TestimonialCard name="כרמל" quote="תוכן מעולה" />);
    expect(screen.queryByRole('img', { name: /דירוג/ })).not.toBeInTheDocument();
    expect(container.querySelector('.bs-stars')).toBeNull();
  });

  it('shows stars when a rating is given', () => {
    render(<TestimonialCard name="כרמל" quote="תוכן מעולה" rating={4} />);
    expect(screen.getByRole('img', { name: 'דירוג 4 מתוך 5' })).toBeInTheDocument();
  });

  it('renders the quote, name and detail', () => {
    render(<TestimonialCard name="אוריה" quote="אין כמוך" detail="אמא של נועם" />);
    expect(screen.getByText('אין כמוך')).toBeInTheDocument();
    expect(screen.getByText('אוריה')).toBeInTheDocument();
    expect(screen.getByText('אמא של נועם')).toBeInTheDocument();
  });
});
