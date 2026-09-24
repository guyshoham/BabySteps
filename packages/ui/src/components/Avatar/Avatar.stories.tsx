import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import { storyAssets } from '../../../.storybook/assets';

const meta = {
  title: 'Base/Avatar',
  component: Avatar,
  args: { name: 'ירדן שוהם' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Photo: Story = { args: { src: storyAssets.aboutPhoto, size: 'lg' } };
export const Initials: Story = {};
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
      <Avatar name="כרמל" size="sm" />
      <Avatar name="טל כהן" size="md" />
      <Avatar name="ירדן שוהם" src={storyAssets.aboutPhoto} size="lg" />
    </div>
  ),
};
