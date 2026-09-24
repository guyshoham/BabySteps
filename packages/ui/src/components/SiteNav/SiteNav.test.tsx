import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteNav } from './SiteNav';

const links = [
  { label: 'הקורסים', href: '#courses' },
  { label: 'מי אני', href: '#about' },
];

function toggle() {
  return screen.getByRole('button', { name: 'תפריט' });
}

describe('SiteNav', () => {
  it('toggles the mobile menu', async () => {
    render(<SiteNav title="מתחילים בקטן" links={links} />);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    const menuId = toggle().getAttribute('aria-controls')!;
    expect(document.getElementById(menuId)).toBeInTheDocument();
    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape', async () => {
    render(<SiteNav links={links} />);
    await userEvent.click(toggle());
    await userEvent.keyboard('{Escape}');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when a link is clicked', async () => {
    render(<SiteNav links={links} />);
    await userEvent.click(toggle());
    await userEvent.click(screen.getByRole('link', { name: 'מי אני' }));
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no toggle when there are no links and no cta', () => {
    render(<SiteNav title="מתחילים בקטן" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
