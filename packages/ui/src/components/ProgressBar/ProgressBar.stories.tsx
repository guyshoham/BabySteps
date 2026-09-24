import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'App/ProgressBar',
  component: ProgressBar,
  args: { value: 40, label: '4 מתוך 10 שיעורים' },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 420 }}><Story /></div>;

export const InProgress: Story = { decorators: [narrow] };
export const Complete: Story = { args: { value: 100, label: 'הקורס הושלם' }, decorators: [narrow] };
export const Small: Story = { args: { size: 'sm', showValue: false, label: undefined }, decorators: [narrow] };
