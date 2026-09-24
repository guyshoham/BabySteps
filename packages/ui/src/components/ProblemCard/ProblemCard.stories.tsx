import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProblemCard } from './ProblemCard';

const meta = {
  title: 'Landing/ProblemCard',
  component: ProblemCard,
  args: {
    emoji: '🙆',
    title: 'התינוק לא מתהפך כלל',
    text: 'אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו ואתם לא בטוחים מה לעשות.',
  },
} satisfies Meta<typeof ProblemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEmoji: Story = { render: (args) => <div style={{ maxWidth: 320 }}><ProblemCard {...args} /></div> };
export const WithIcon: Story = {
  args: { emoji: undefined, icon: 'baby', title: 'מתהפך רק לפעמים', text: 'יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית ועצמאית.' },
  render: (args) => <div style={{ maxWidth: 320 }}><ProblemCard {...args} /></div>,
};
export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
      <ProblemCard emoji="🙆" title="התינוק לא מתהפך כלל" text="אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו." />
      <ProblemCard emoji="🔄" title="מתהפך רק לפעמים" text="יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית." />
      <ProblemCard emoji="↩️" title="מתהפך לכיוון אחד בלבד" text="מצליח לצד אחד אבל מתקשה עם הצד השני." />
    </div>
  ),
};
