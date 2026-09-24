import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Base/Badge',
  component: Badge,
  args: { children: 'קורס דיגיטלי · צפייה מיידית' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tag: Story = { args: { variant: 'tag' } };
export const Pill: Story = { args: { variant: 'pill', children: 'זמין עכשיו' } };
export const Highlight: Story = { args: { variant: 'highlight', icon: 'star', children: 'הכי מומלץ' } };
export const OnPeach: Story = {
  render: () => (
    <div style={{ background: 'var(--surface-peach)', padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
      <Badge>אתגר 5 ימים · חינם</Badge>
      <Badge variant="pill">זמין עכשיו</Badge>
      <Badge variant="highlight" icon="star">הכי מומלץ</Badge>
    </div>
  ),
};
