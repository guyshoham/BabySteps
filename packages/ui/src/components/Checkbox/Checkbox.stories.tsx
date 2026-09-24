import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'App/Checkbox',
  component: Checkbox,
  args: { children: 'אשמח לקבל מיילים עם טיפים ועדכונים' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 360 }}><Story /></div>;

export const EmailConsent: Story = { decorators: [narrow] };
export const Checked: Story = { args: { defaultChecked: true }, decorators: [narrow] };
export const WithHint: Story = {
  args: { hint: 'אפשר לבטל בכל רגע, בקישור שבתחתית כל מייל' },
  decorators: [narrow],
};
export const WithError: Story = {
  args: { children: 'קראתי ואני מסכימה לתנאי השימוש', error: 'צריך לאשר את התנאים כדי להמשיך' },
  decorators: [narrow],
};
export const Disabled: Story = { args: { disabled: true, defaultChecked: true }, decorators: [narrow] };
export const Controlled: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ maxWidth: 360, display: 'grid', gap: 'var(--space-2)' }}>
        <Checkbox {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <p>{checked ? 'נרשמת לקבלת מיילים' : 'לא נרשמת לקבלת מיילים'}</p>
      </div>
    );
  },
};
