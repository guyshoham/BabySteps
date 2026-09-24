import type { Meta, StoryObj } from '@storybook/react-vite';
import { LessonListItem } from './LessonListItem';

const meta = {
  title: 'App/LessonListItem',
  component: LessonListItem,
  args: { title: 'תרגיל 1: הכנה על הגב', index: 1, durationSec: 185, href: '#' },
  decorators: [(Story) => <ol className="bs-lesson-list" style={{ maxWidth: 560 }}><Story /></ol>],
} satisfies Meta<typeof LessonListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Todo: Story = {};
export const Current: Story = { args: { state: 'current' } };
export const Done: Story = { args: { state: 'done' } };
export const Locked: Story = { args: { state: 'locked', title: 'בונוס: הכנה לשלב הזחילה' } };
export const FullList: Story = {
  decorators: [],
  render: () => (
    <ol className="bs-lesson-list" style={{ maxWidth: 560 }}>
      <LessonListItem index={1} title="היכרות: למה התהפכות חשובה" durationSec={142} state="done" href="#" />
      <LessonListItem index={2} title="תרגיל 1: הכנה על הגב" durationSec={185} state="done" href="#" />
      <LessonListItem index={3} title="תרגיל 2: העברת משקל לצד" durationSec={240} state="current" href="#" />
      <LessonListItem index={4} title="תרגיל 3: מהבטן לגב" durationSec={205} href="#" />
      <LessonListItem index={5} title="בונוס: הכנה לשלב הזחילה" durationSec={320} state="locked" href="#" />
    </ol>
  ),
};
export const LongText: Story = {
  args: { title: 'תרגיל ארוך במיוחד עם שם שנשבר לשתי שורות לפחות גם במסך צר של טלפון נייד', state: 'current' },
};
