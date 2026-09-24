import type { Meta, StoryObj } from '@storybook/react-vite';
import { sectionTones } from '../../utils/tone';
import { Section } from './Section';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { ProblemCard } from '../ProblemCard/ProblemCard';
import { PriceCard } from '../PriceCard/PriceCard';
import { Button } from '../Button/Button';

const meta = {
  title: 'Layout/Section',
  component: Section,
  parameters: { bsFlush: true },
  args: { tone: 'peach' },
  argTypes: { tone: { control: 'select', options: sectionTones } },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Peach: Story = {
  render: (args) => (
    <Section {...args}>
      <SectionHeading eyebrow="מזהה את עצמך?" title="האם זה המצב אצלכם כרגע?" lead="שלושה מצבים נפוצים שאמהות מספרות לי עליהם." />
    </Section>
  ),
};

export const Cocoa: Story = {
  args: { tone: 'cocoa' },
  render: (args) => (
    <Section {...args}>
      <SectionHeading eyebrow="הצטרפות" title="מוכנה להתחיל?" lead="גישה מיידית לכל הסרטונים וליווי אישי בווטסאפ." />
    </Section>
  ),
};

export const CocoaWithCards: Story = {
  args: { tone: 'cocoa' },
  render: (args) => (
    <Section {...args}>
      <SectionHeading eyebrow="הצטרפות" title="מוכנה להתחיל?" lead="גישה מיידית לכל הסרטונים וליווי אישי בווטסאפ." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)', marginBlockStart: 'var(--space-6)' }}>
        <ProblemCard emoji="🙆" title="התינוק לא מתהפך כלל" text="אתם מנסים, אבל הוא עדיין לא עושה את התנועה בעצמו." />
        <ProblemCard emoji="🔄" title="מתהפך רק לפעמים" text="יש ניסיונות, אבל ההתהפכות לא קורית בצורה עקבית." />
        <PriceCard
          title="תשלום דרך PayPal"
          description="משלמות דרך PayPal ומקבלות מייל עם פרטי גישה, מיד אחרי התשלום."
          price="₪175"
          oldPrice="₪205"
          priceNote="תשלום חד-פעמי"
          features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ', 'גישה מיידית, ללא עיכובים']}
          cta={<Button icon="arrow">שלמי וקבלי גישה מיידית</Button>}
        />
      </div>
    </Section>
  ),
};

export const AllTones: Story = {
  render: () => (
    <>
      {sectionTones.map((tone) => (
        <Section key={tone} tone={tone} padding="sm">
          <SectionHeading title={`tone="${tone}"`} />
        </Section>
      ))}
    </>
  ),
};
