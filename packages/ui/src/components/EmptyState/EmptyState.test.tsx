import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title as a heading and the text', () => {
    render(<EmptyState title="עדיין אין לך קורסים" text="הקורס יופיע כאן" />);
    expect(screen.getByRole('heading', { level: 2, name: 'עדיין אין לך קורסים' })).toBeInTheDocument();
    expect(screen.getByText('הקורס יופיע כאן')).toBeInTheDocument();
  });

  it('shows a hidden icon only when one is given', () => {
    const { container, rerender } = render(<EmptyState title="ריק" />);
    expect(container.querySelector('svg')).toBeNull();
    rerender(<EmptyState title="ריק" icon="baby" />);
    expect(container.querySelector('.bs-empty-state__icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the action prop and children in the action row', () => {
    const { container } = render(
      <EmptyState title="ריק" action={<a href="/courses">לכל הקורסים</a>} headingLevel="h3">
        <a href="/help">עזרה</a>
      </EmptyState>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    const row = container.querySelector('.bs-empty-state__action');
    expect(row?.querySelectorAll('a')).toHaveLength(2);
  });

  it('has no action row without an action', () => {
    const { container } = render(<EmptyState title="ריק" />);
    expect(container.querySelector('.bs-empty-state__action')).toBeNull();
  });
});
