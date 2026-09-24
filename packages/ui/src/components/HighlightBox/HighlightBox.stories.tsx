import type { Meta, StoryObj } from '@storybook/react-vite';
import { HighlightBox } from './HighlightBox';

const meta = {
  title: 'Landing/HighlightBox',
  component: HighlightBox,
  args: {
    icon: 'sparkle',
    title: 'אם הכרת לפחות אחד מהמצבים האלה',
    children: 'הקורס הזה נבנה בדיוק בשבילך. בצעדים קטנים, עם הידיים, מהסלון שלך.',
  },
} satisfies Meta<typeof HighlightBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mint: Story = { render: (args) => <div style={{ maxWidth: 720 }}><HighlightBox {...args} /></div> };
export const Peach: Story = { args: { tone: 'peach' }, render: (args) => <div style={{ maxWidth: 720 }}><HighlightBox {...args} /></div> };
export const NoIcon: Story = { args: { icon: undefined, tone: 'sky' }, render: (args) => <div style={{ maxWidth: 720 }}><HighlightBox {...args} /></div> };
