import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';

const box = { background: 'var(--surface-peach)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' };

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { bsFlush: true },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Widths: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', paddingBlock: 'var(--space-6)' }}>
      <Container width="narrow"><div style={box}>narrow · 720px</div></Container>
      <Container width="base"><div style={box}>base · 1040px</div></Container>
      <Container width="wide"><div style={box}>wide · 1240px</div></Container>
    </div>
  ),
};
