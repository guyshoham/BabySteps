import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Base/Card',
  component: Card,
  args: {
    children: (
      <>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>6 טיפי זהב</h3>
        <p>טיפים מעשיים שיעזרו לך ללוות את התינוק בצורה הכי נכונה.</p>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div> };
export const LargePadding: Story = { args: { padding: 'lg' }, render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div> };
export const HoverLift: Story = { args: { hoverLift: true }, render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div> };
