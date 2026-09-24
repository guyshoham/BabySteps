import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from './FAQ';

const items = [
  { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך לשני הצדדים.' },
  { question: 'כמה זמן יש לי גישה?', answer: 'הגישה לסרטונים היא לשנה מלאה.' },
];

function q(name: string) {
  return screen.getByRole('button', { name });
}

describe('FAQ', () => {
  it('starts closed and opens an item on click', async () => {
    render(<FAQ items={items} />);
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(items[0].answer)).not.toBeVisible();
    await userEvent.click(q('לאיזה גיל הקורס מתאים?'));
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(items[0].answer)).toBeVisible();
  });

  it('keeps only one item open', async () => {
    render(<FAQ items={items} />);
    await userEvent.click(q('לאיזה גיל הקורס מתאים?'));
    await userEvent.click(q('כמה זמן יש לי גישה?'));
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
    expect(q('כמה זמן יש לי גישה?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes an open item when clicked again', async () => {
    render(<FAQ items={items} defaultOpen={0} />);
    await userEvent.click(q('לאיזה גיל הקורס מתאים?'));
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
  });

  it('links each button to its panel', () => {
    render(<FAQ items={items} defaultOpen={1} />);
    const button = q('כמה זמן יש לי גישה?');
    const panel = document.getElementById(button.getAttribute('aria-controls')!);
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveTextContent(items[1].answer);
  });

  it('opens with the keyboard', async () => {
    render(<FAQ items={items} />);
    q('לאיזה גיל הקורס מתאים?').focus();
    await userEvent.keyboard('{Enter}');
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    expect(q('לאיזה גיל הקורס מתאים?')).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores an out-of-range defaultOpen', () => {
    render(<FAQ items={items} defaultOpen={5} />);
    expect(screen.getAllByRole('button').every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);
  });
});
