import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('uses role alert for errors', () => {
    render(<Alert variant="error" title="ההתחברות נכשלה">בדקי את האימייל והסיסמה.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('ההתחברות נכשלה');
  });

  it('uses role status for the other variants', () => {
    render(<Alert variant="success" title="נשלח מייל לאיפוס סיסמה" />);
    expect(screen.getByRole('status')).toHaveTextContent('נשלח מייל לאיפוס סיסמה');
  });
});
