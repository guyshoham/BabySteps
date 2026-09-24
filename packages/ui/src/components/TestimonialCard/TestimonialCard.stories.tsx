import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { TestimonialCard } from './TestimonialCard';

const meta = {
  title: 'Landing/TestimonialCard',
  component: TestimonialCard,
  args: {
    quote: 'תודה רבה ירדן על הכל! כבר קורס שני שאני איתך, אין כמוך ❤️',
    name: 'אוריה',
    detail: 'אמא של נועם, 5 חודשים',
  },
} satisfies Meta<typeof TestimonialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const narrow: Decorator = (Story) => <div style={{ maxWidth: 380 }}><Story /></div>;

export const Default: Story = { decorators: [narrow] };
export const WithPhoto: Story = { args: { avatar: '/about.jpg', name: 'כרמל' }, decorators: [narrow] };
export const NoRating: Story = { args: { rating: null }, decorators: [narrow] };
export const LongText: Story = {
  args: {
    name: 'טל',
    quote:
      'ירדנוש אהובה שלי, מעבר לזה שאת חברה את אשת מקצוע נדירה 😍 תודה על כל העזרה, על הליווי הצמוד ועל התמיכה! ללא ספק למדתי ממך מלא ואני בטוחה שכולן פה יכולות להעיד על כך. איזה כיף שיש אותך!! זכינו בך וכמובן שמחכות לקורס הבא ❤️❤️❤️ https://www.instagram.com/a-very-long-link-that-should-wrap-inside-the-card',
  },
  decorators: [narrow],
};
