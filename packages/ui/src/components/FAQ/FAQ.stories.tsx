import type { Meta, StoryObj } from '@storybook/react-vite';
import { FAQ } from './FAQ';

const meta = {
  title: 'Landing/FAQ',
  component: FAQ,
  args: {
    items: [
      { question: 'לאיזה גיל הקורס מתאים?', answer: 'מגיל 3 חודשים ועד שהתינוק מתהפך בביטחון לשני הצדדים.' },
      { question: 'כמה זמן יש לי גישה לסרטונים?', answer: 'הגישה היא לשנה מלאה, ואפשר לצפות כמה פעמים שרוצים.' },
      { question: 'איך עובד הליווי בווטסאפ?', answer: 'שולחת לי סרטון קצר של התרגול, ואני מחזירה פידבק ודיוק אישי.' },
      { question: 'מה אם התינוק שלי כבר מתהפך לצד אחד?', answer: 'מצוין! הקורס עוזר גם לאזן ולהתהפך לצד השני.' },
    ],
  },
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { render: (args) => <div style={{ maxWidth: 720 }}><FAQ {...args} /></div> };
export const FirstOpen: Story = { args: { defaultOpen: 0 }, render: (args) => <div style={{ maxWidth: 720 }}><FAQ {...args} /></div> };
