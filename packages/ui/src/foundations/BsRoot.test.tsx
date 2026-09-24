import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BsRoot } from './BsRoot';

describe('BsRoot', () => {
  it('sets RTL, Hebrew and the root class', () => {
    render(<BsRoot data-testid="root" className="extra">שלום</BsRoot>);
    const root = screen.getByTestId('root');
    expect(root).toHaveAttribute('dir', 'rtl');
    expect(root).toHaveAttribute('lang', 'he');
    expect(root).toHaveClass('bs-root', 'extra');
    expect(root).toHaveTextContent('שלום');
  });
});
