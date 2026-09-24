import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'App/EmptyState',
  component: EmptyState,
  args: {
    icon: 'baby',
    title: 'עדיין אין לך קורסים',
    text: 'אחרי הרכישה הקורס יופיע כאן, ואפשר יהיה להתחיל לצפות מיד.',
  },
  render: (args) => <div style={{ maxWidth: 520 }}><EmptyState {...args} /></div>,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoCourses: Story = {
  args: { action: <Button href="#courses" icon="arrow">לכל הקורסים</Button> },
};
export const WithLink: Story = {
  args: {
    icon: 'video',
    title: 'אין עדיין שיעורים בקורס',
    text: 'השיעורים יעלו בקרוב. נשלח לך מייל כשהם מוכנים.',
    action: <a href="#my-courses">חזרה לקורסים שלי</a>,
  },
};
export const TextOnly: Story = { args: { icon: undefined, text: undefined } };
