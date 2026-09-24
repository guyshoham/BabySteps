import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, iconNames } from './Icon';

const meta = {
  title: 'Base/Icon',
  component: Icon,
  args: { name: 'heart', size: 32 },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => (
    <span style={{ color: 'var(--color-brand-600)' }}>
      <Icon {...args} />
    </span>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', color: 'var(--color-brand-600)' }}>
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-2)', width: 72 }}>
          <Icon name={name} size={28} />
          <code dir="ltr" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>{name}</code>
        </div>
      ))}
    </div>
  ),
};
