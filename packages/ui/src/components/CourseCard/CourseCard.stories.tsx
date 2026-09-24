import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { CourseCard } from './CourseCard';
import { Button } from '../Button/Button';
import { storyAssets } from '../../../.storybook/assets';

const meta = {
  title: 'Landing/CourseCard',
  component: CourseCard,
  args: {
    title: 'קורס התהפכות',
    description: '10 סרטוני הדרכה פרקטיים, 6 טיפי זהב וליווי אישי בווטסאפ. כל הכלים לעזור לתינוק שלך להתהפך בביטחון.',
    emoji: '🔄',
    status: 'זמין עכשיו',
    meta: ['10 סרטונים', 'ליווי בווטסאפ', '200+ אמהות'],
    price: '₪105',
    cta: <Button size="sm" icon="arrow" href="/challenge/rolling/">לקורס ולרכישה</Button>,
  },
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 380 }}><Story /></div>;

export const Available: Story = { decorators: [narrow] };
export const WithImage: Story = { args: { image: storyAssets.teaserPoster, imageAlt: 'תינוק על מזרן' }, decorators: [narrow] };
export const ComingSoon: Story = {
  args: {
    title: 'קורס שכיבה על הבטן',
    description: 'קורס מקיף שיעזור לך לעודד את התינוק ליהנות מהשכיבה על הבטן ולחזק את הבסיס המוטורי שלו.',
    emoji: '🤱',
    tone: 'mint',
    status: 'בקרוב',
    comingSoon: true,
    meta: [],
    price: undefined,
    cta: undefined,
  },
  decorators: [narrow],
};
export const LongText: Story = {
  args: {
    title: 'קורס מקיף להתפתחות מוטורית בשנה הראשונה: התהפכות, זחילה, ישיבה ועמידה',
    description:
      'תיאור ארוך במיוחד שבודק שהטקסט נשבר יפה בתוך הכרטיס ולא יוצא ממנו גם במסך צר של טלפון נייד: https://babysteps.example/courses/rolling-over-program-for-babies-from-three-months',
  },
  decorators: [narrow],
};
export const PortraitImage: Story = {
  args: { image: storyAssets.aboutPhoto, imageAlt: 'תמונה לאורך של הכשרה' },
  decorators: [narrow],
};
