import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon, iconNames } from './Icon';

describe('Icon', () => {
  it('is hidden from screen readers without a label', () => {
    const { container } = render(<Icon name="star" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is an image with a name when labelled', () => {
    render(<Icon name="lock" label="נעול" />);
    expect(screen.getByRole('img', { name: 'נעול' })).toBeInTheDocument();
  });

  it('renders every icon name with drawn content', () => {
    for (const name of iconNames) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector('svg')?.childElementCount).toBeGreaterThan(0);
      unmount();
    }
  });
});
