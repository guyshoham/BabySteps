import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoFrame } from './VideoFrame';

const meta = {
  title: 'Landing/VideoFrame',
  component: VideoFrame,
  args: { poster: '/rolling-teaser-poster.jpg', caption: 'הצצה לקורס, דקה וחצי' },
} satisfies Meta<typeof VideoFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Landscape: Story = { render: (args) => <div style={{ maxWidth: 720 }}><VideoFrame {...args} /></div> };
export const Portrait: Story = { args: { aspect: '9/16', caption: undefined }, render: (args) => <div style={{ maxWidth: 320 }}><VideoFrame {...args} /></div> };
export const NoPoster: Story = { args: { poster: undefined, caption: undefined }, render: (args) => <div style={{ maxWidth: 720 }}><VideoFrame {...args} /></div> };
