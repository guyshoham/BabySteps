import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is a labelled checkbox that toggles when uncontrolled', async () => {
    render(<Checkbox>אשמח לקבל מיילים</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'אשמח לקבל מיילים' });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText('אשמח לקבל מיילים'));
    expect(box).toBeChecked();
  });

  it('follows the checked prop when controlled', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Checkbox checked={false} onChange={onChange}>מיילים</Checkbox>,
    );
    const box = screen.getByRole('checkbox');
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(box).not.toBeChecked();
    rerender(<Checkbox checked onChange={onChange}>מיילים</Checkbox>);
    expect(box).toBeChecked();
  });

  it('links hint and error through aria-describedby and marks it invalid', () => {
    render(
      <Checkbox hint="אפשר לבטל בכל רגע" error="צריך לאשר">
        תנאים
      </Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: 'תנאים' });
    const ids = box.getAttribute('aria-describedby')!.split(' ');
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
      'אפשר לבטל בכל רגע',
      'צריך לאשר',
    ]);
    expect(box).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not toggle when disabled', async () => {
    render(<Checkbox disabled>מיילים</Checkbox>);
    const box = screen.getByRole('checkbox');
    expect(box).toBeDisabled();
    await userEvent.click(box);
    expect(box).not.toBeChecked();
  });
});
