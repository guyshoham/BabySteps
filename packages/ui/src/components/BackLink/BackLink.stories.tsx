import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackLink } from './BackLink';

const meta = {
  title: 'Base/BackLink',
  component: BackLink,
  args: { href: '#', children: 'חזרה לקורס' },
} satisfies Meta<typeof BackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BackToCourse: Story = {};
export const MyCourses: Story = { args: { children: 'הקורסים שלי' } };
