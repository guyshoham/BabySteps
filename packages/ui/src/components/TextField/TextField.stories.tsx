import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta = {
  title: 'App/TextField',
  component: TextField,
  args: { label: 'אימייל', type: 'email', placeholder: 'name@example.com' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 360 }}><Story /></div>;

export const Email: Story = { decorators: [narrow] };
export const PasswordWithHint: Story = { args: { label: 'סיסמה', type: 'password', placeholder: '', hint: 'קיבלת את הסיסמה במייל אחרי הרכישה' }, decorators: [narrow] };
export const WithError: Story = { args: { error: 'האימייל או הסיסמה שגויים', defaultValue: 'yarden@example' }, decorators: [narrow] };
export const Text: Story = { args: { label: 'שם מלא', type: 'text', placeholder: 'ירדן שוהם' }, decorators: [narrow] };
