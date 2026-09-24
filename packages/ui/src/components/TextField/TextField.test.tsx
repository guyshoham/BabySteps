import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField } from './TextField';

describe('TextField', () => {
  it('labels the input', () => {
    render(<TextField label="אימייל" type="email" />);
    const input = screen.getByLabelText('אימייל');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('dir', 'ltr');
  });

  it('links hint and error through aria-describedby and marks the input invalid', () => {
    render(<TextField label="סיסמה" type="password" hint="לפחות 8 תווים" error="הסיסמה שגויה" />);
    const input = screen.getByLabelText('סיסמה');
    const ids = input.getAttribute('aria-describedby')!.split(' ');
    const texts = ids.map((id) => document.getElementById(id)?.textContent);
    expect(texts).toEqual(['לפחות 8 תווים', 'הסיסמה שגויה']);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps a caller aria-describedby and has no aria-invalid without an error', () => {
    render(<TextField label="שם" aria-describedby="external" />);
    const input = screen.getByLabelText('שם');
    expect(input).toHaveAttribute('aria-describedby', 'external');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('dir');
  });
});
