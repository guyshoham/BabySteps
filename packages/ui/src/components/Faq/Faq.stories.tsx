import type { Meta, StoryObj } from '@storybook/react-vite';
import { Faq } from './Faq';

const meta = {
  title: 'Landing/Faq',
  component: Faq,
  args: {
    items: [
      { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך בביטחון לשני הצדדים.' },
      { question: 'כמה זמן יש לי גישה לסרטונים?', answer: 'הגישה היא לשנה מלאה, ואפשר לצפות כמה פעמים שרוצים.' },
      { question: 'איך עובד הליווי בווטסאפ?', answer: 'שולחת לי סרטון קצר של התרגול, ואני מחזירה פידבק ודיוק אישי.' },
      { question: 'מה אם התינוק שלי כבר מתהפך לצד אחד?', answer: 'מצוין! הקורס עוזר גם לאזן ולהתהפך לצד השני.' },
    ],
  },
} satisfies Meta<typeof Faq>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { render: (args) => <div style={{ maxWidth: 720 }}><Faq {...args} /></div> };
export const FirstOpen: Story = { args: { defaultOpen: 0 }, render: (args) => <div style={{ maxWidth: 720 }}><Faq {...args} /></div> };
