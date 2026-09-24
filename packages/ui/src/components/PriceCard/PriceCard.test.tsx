import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceCard } from './PriceCard';

describe('PriceCard', () => {
  it('shows the price, the old price for screen readers, and the features', () => {
    const { container } = render(
      <PriceCard title="גישה מיידית" price="₪175" oldPrice="₪205" features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ']} />,
    );
    expect(screen.getByRole('heading', { name: 'גישה מיידית' })).toBeInTheDocument();
    expect(screen.getByText('₪175')).toBeInTheDocument();
    expect(container.querySelector('s.bs-price-card__old')).toHaveTextContent('מחיר קודם: ₪205');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('marks the featured card and shows its badge', () => {
    const { container } = render(<PriceCard title="PayPal" price="₪175" featured badge="הכי מומלץ" />);
    expect(container.firstElementChild).toHaveClass('bs-price-card--featured');
    expect(screen.getByText('הכי מומלץ')).toBeInTheDocument();
  });

  it('renders no feature list when features is empty', () => {
    render(<PriceCard title="העברה ידנית" price="₪175" features={[]} />);
    expect(screen.queryByRole('list')).toBeNull();
  });
});
