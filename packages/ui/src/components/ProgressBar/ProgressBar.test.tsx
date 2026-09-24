import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes the value and label', () => {
    render(<ProgressBar value={40} label="התקדמות בקורס" />);
    const bar = screen.getByRole('progressbar', { name: 'התקדמות בקורס' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('clamps out-of-range and invalid values', () => {
    const { rerender } = render(<ProgressBar value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar value={Number.NaN} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('can hide the number', () => {
    render(<ProgressBar value={50} showValue={false} />);
    expect(screen.queryByText('50%')).toBeNull();
  });
});
