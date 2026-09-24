import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Base/Button',
  component: Button,
  args: { children: 'להצטרפות לאתגר' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { icon: 'arrow' } };
export const Outline: Story = { args: { variant: 'outline', children: 'איך זה עובד?' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'לכל הקורסים' } };
export const WhatsApp: Story = { args: { variant: 'whatsapp', children: 'דברי איתי בווטסאפ' } };
export const Loading: Story = { args: { loading: true, children: 'שולחת...' } };
export const Disabled: Story = { args: { disabled: true } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="sm">קטן</Button>
      <Button size="md">בינוני</Button>
      <Button size="lg" icon="arrow">לרכישה וגישה מיידית</Button>
    </div>
  ),
};
export const FullWidth: Story = {
  args: { fullWidth: true, children: 'שלמי וקבלי גישה מיידית', icon: 'arrow' },
  render: (args) => <div style={{ maxWidth: 360 }}><Button {...args} /></div>,
};
export const AsLink: Story = { args: { href: '#register', children: 'לקורס ולרכישה', icon: 'arrow' } };
