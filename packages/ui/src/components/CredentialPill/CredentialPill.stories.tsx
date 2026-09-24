import type { Meta, StoryObj } from '@storybook/react-vite';
import { CredentialPill } from './CredentialPill';

const meta = {
  title: 'Landing/CredentialPill',
  component: CredentialPill,
  args: { children: 'מלווה התפתחותית מוסמכת' },
} satisfies Meta<typeof CredentialPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
      <CredentialPill>מלווה התפתחותית מוסמכת</CredentialPill>
      <CredentialPill icon="heart">מדריכת בייבי יוגה</CredentialPill>
      <CredentialPill icon="baby">עיסוי תינוקות</CredentialPill>
    </div>
  ),
};
