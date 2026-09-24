import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta = {
  title: 'App/Alert',
  component: Alert,
  args: { title: 'נשלח אלייך מייל לאיפוס הסיסמה', children: 'לא מוצאת? כדאי לבדוק גם בתיקיית הספאם.' },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 480 }}><Story /></div>;

export const Success: Story = { args: { variant: 'success' }, decorators: [narrow] };
export const Error: Story = { args: { variant: 'error', title: 'ההתחברות נכשלה', children: 'בדקי את האימייל והסיסמה ונסי שוב.' }, decorators: [narrow] };
export const Warning: Story = { args: { variant: 'warning', title: 'הגישה לקורס מסתיימת בעוד 7 ימים', children: undefined }, decorators: [narrow] };
export const Info: Story = { args: { variant: 'info', title: 'טיפ: אפשר לצפות בסרטונים גם מהטלפון', children: undefined }, decorators: [narrow] };
