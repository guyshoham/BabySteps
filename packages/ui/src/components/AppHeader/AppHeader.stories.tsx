import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './AppHeader';

const meta = {
  title: 'App/AppHeader',
  component: AppHeader,
  parameters: { bsFlush: true },
  args: {
    logo: { src: '/logo-peach.png', alt: '' },
    title: 'מתחילים בקטן',
    userName: 'נועה לוי',
    onSignOut: () => {},
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};
export const SignedOut: Story = { args: { userName: undefined, onSignOut: undefined } };
