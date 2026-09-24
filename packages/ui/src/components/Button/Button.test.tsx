import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('is a button of type "button" by default and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>להצטרפות</Button>);
    const button = screen.getByRole('button', { name: 'להצטרפות' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('while loading: disabled, busy, and does not fire onClick', async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>שליחה</Button>);
    const button = screen.getByRole('button', { name: /שליחה/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a link when href is set', () => {
    render(<Button href="/challenge/rolling/">לקורס</Button>);
    expect(screen.getByRole('link', { name: 'לקורס' })).toHaveAttribute('href', '/challenge/rolling/');
  });

  it('a loading link has no href, is aria-disabled, and does not fire onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button href="/buy" loading onClick={onClick}>לרכישה</Button>,
    );
    const link = container.querySelector('a');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('whatsapp variant shows the whatsapp icon by default', () => {
    const { container } = render(<Button variant="whatsapp">דברי איתי</Button>);
    expect(container.querySelectorAll('svg.bs-icon')).toHaveLength(1);
  });
});
