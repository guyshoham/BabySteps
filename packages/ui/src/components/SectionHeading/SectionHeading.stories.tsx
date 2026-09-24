import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeading } from './SectionHeading';

const meta = {
  title: 'Layout/SectionHeading',
  component: SectionHeading,
  args: {
    eyebrow: 'תוכן הקורס',
    title: <>מה <em>מחכה לך</em> בפנים?</>,
    lead: 'כל מה שצריך כדי לעזור לתינוק שלך להתהפך, בצעדים קטנים ומהסלון שלך.',
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centered: Story = {};
export const Start: Story = { args: { align: 'start' } };
export const TitleOnly: Story = { args: { eyebrow: undefined, lead: undefined, title: 'מה אומרות האמהות?' } };
