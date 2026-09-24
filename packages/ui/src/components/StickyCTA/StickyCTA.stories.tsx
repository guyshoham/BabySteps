import type { Meta, StoryObj } from '@storybook/react-vite';
import { StickyCTA } from './StickyCTA';
import { Button } from '../Button/Button';

const meta = {
  title: 'Landing/StickyCTA',
  component: StickyCTA,
  args: {
    title: 'קורס מתהפכים',
    subtitle: '₪175 · גישה מיידית',
    action: <Button size="sm" icon="arrow">לרכישה</Button>,
    position: 'static',
  },
} satisfies Meta<typeof StickyCTA>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = { render: (args) => <div style={{ maxWidth: 420 }}><StickyCTA {...args} /></div> };
export const FixedOnMobile: Story = {
  args: { position: 'fixed' },
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: (args) => (
    <div style={{ minHeight: '120vh', paddingBlockEnd: 96 }}>
      <p>גללי למטה. הפס קבוע בתחתית המסך בטלפון בלבד.</p>
      <StickyCTA {...args} />
    </div>
  ),
};
