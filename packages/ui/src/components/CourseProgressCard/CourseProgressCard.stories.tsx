import type { Meta, StoryObj } from '@storybook/react-vite';
import { CourseProgressCard } from './CourseProgressCard';
import { storyAssets } from '../../../.storybook/assets';

const meta = {
  title: 'App/CourseProgressCard',
  component: CourseProgressCard,
  args: { title: 'קורס התהפכות', lessonsDone: 4, lessonsTotal: 10, href: '#', image: storyAssets.teaserPoster },
  decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
} satisfies Meta<typeof CourseProgressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};
export const NotStarted: Story = { args: { lessonsDone: 0 } };
export const Complete: Story = { args: { lessonsDone: 10 } };
export const NoImage: Story = { args: { image: undefined, title: 'קורס שכיבה על הבטן' } };
