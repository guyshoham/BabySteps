import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('shows the user and signs out', async () => {
    const onSignOut = vi.fn();
    render(<AppHeader title="מתחילים בקטן" userName="נועה לוי" onSignOut={onSignOut} />);
    expect(screen.getByText('נועה לוי')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'התנתקות' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('has no user area when signed out', () => {
    const { container } = render(<AppHeader title="מתחילים בקטן" />);
    expect(container.querySelector('.bs-app-header__user')).toBeNull();
  });
});
