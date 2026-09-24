import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarRating } from './StarRating';

const meta = {
  title: 'Base/StarRating',
  component: StarRating,
  args: { value: 5 },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Five: Story = {};
export const Three: Story = { args: { value: 3 } };
export const Large: Story = { args: { value: 4, size: 28 } };
