import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from './Hero';
import { Button } from '../Button/Button';
import { storyAssets } from '../../../.storybook/assets';

const meta = {
  title: 'Landing/Hero',
  component: Hero,
  parameters: { bsFlush: true },
  args: {
    tag: 'קורס דיגיטלי · צפייה מיידית',
    title: <>לעזור לבייבי שלך <em>להתהפך</em>, בצורה רגועה ומקצועית</>,
    subtitle: 'היי אהובה, כאן ירדן. בניתי עבורך קורס דיגיטלי ממוקד שייתן לך את כל הכלים לעזור לתינוק שלך לעבור את שלב ההתהפכות, בביטחון מלא.',
    actions: (
      <>
        <Button size="lg" icon="arrow">רכישה וגישה מיידית</Button>
        <Button size="lg" variant="outline">מה יש בקורס?</Button>
      </>
    ),
    proof: <span>ליווי אישי בווטסאפ</span>,
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centered: Story = {};
export const WithImage: Story = {
  args: { media: <img src={storyAssets.aboutPhoto} alt="ירדן שוהם עם תינוק" /> },
};
export const MintTone: Story = {
  args: { tone: 'mint', tag: 'אתגר 5 ימים · חינם', title: <>5 ימים של <em>שכיבה על הבטן</em>, בלי בכי</>, proof: undefined },
};
