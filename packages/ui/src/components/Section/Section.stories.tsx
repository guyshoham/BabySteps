import type { Meta, StoryObj } from '@storybook/react-vite';
import { sectionTones } from '../../utils/tone';
import { Section } from './Section';
import { SectionHeading } from '../SectionHeading/SectionHeading';

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
