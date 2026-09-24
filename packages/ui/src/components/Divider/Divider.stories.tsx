import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
  title: 'Base/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  render: (args) => (
    <div>
      <p>פסקה ראשונה.</p>
      <Divider {...args} variant="line" />
      <p>פסקה שנייה.</p>
    </div>
  ),
};

export const WavePeachToWhite: Story = {
  args: { variant: 'wave', from: 'peach', tone: 'white' },
  parameters: { bsFlush: true },
  render: (args) => (
    <div>
      <div style={{ background: 'var(--surface-peach)', height: 120 }} />
      <Divider {...args} />
      <div style={{ background: 'var(--surface-card)', height: 120 }} />
    </div>
  ),
};

export const WaveIntoCocoa: Story = {
  args: { variant: 'wave', from: 'cream', tone: 'cocoa' },
  parameters: { bsFlush: true },
  render: (args) => (
    <div>
      <div style={{ height: 80 }} />
      <Divider {...args} />
      <div style={{ background: 'var(--surface-cocoa)', height: 80 }} />
    </div>
  ),
};
