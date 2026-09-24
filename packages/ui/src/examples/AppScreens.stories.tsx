import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  AppHeader,
  Button,
  Card,
  Container,
  CourseProgressCard,
  LessonListItem,
  ProgressBar,
  SectionHeading,
  TextField,
  VideoFrame,
} from '../index';

const logo = { src: '/logo-peach.png', alt: '' };

function Login() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)', background: 'var(--surface-peach)' }}>
      <Card padding="lg" style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 'var(--space-4)' }}>
        <img src="/logo-peach.png" alt="" style={{ width: 64, height: 64, borderRadius: '50%', marginInline: 'auto' }} />
        <SectionHeading level={1} title="כניסה לקורסים" lead="פרטי הכניסה נשלחו אלייך במייל אחרי הרכישה." style={{ marginBlockEnd: 0 }} />
        <Alert variant="error" title="האימייל או הסיסמה שגויים" />
        <TextField label="אימייל" type="email" placeholder="name@example.com" />
        <TextField label="סיסמה" type="password" />
        <Button fullWidth type="submit">כניסה</Button>
        <Button fullWidth variant="ghost" size="sm">שכחתי סיסמה</Button>
      </Card>
    </div>
  );
}

function MyCourses() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader logo={logo} title="מתחילים בקטן" userName="נועה לוי" onSignOut={() => {}} />
      <Container width="base" style={{ paddingBlock: 'var(--space-7)' }}>
        <SectionHeading align="start" level={1} title="הקורסים שלי" lead="שמחה שאת כאן. ממשיכות מאיפה שעצרת?" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          <CourseProgressCard title="קורס התהפכות" image="/rolling-teaser-poster.jpg" lessonsDone={4} lessonsTotal={10} href="#" />
          <CourseProgressCard title="קורס שכיבה על הבטן" lessonsDone={0} lessonsTotal={8} href="#" />
        </div>
      </Container>
    </div>
  );
}

function LessonScreen() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader logo={logo} title="מתחילים בקטן" userName="נועה לוי" onSignOut={() => {}} />
      <Container width="base" style={{ paddingBlock: 'var(--space-6)', display: 'grid', gap: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Button variant="ghost" size="sm" href="#" style={{ justifySelf: 'start' }}>חזרה לקורס</Button>
          <VideoFrame poster="/rolling-teaser-poster.jpg" />
          <SectionHeading align="start" level={1} eyebrow="שיעור 3 מתוך 10" title="תרגיל 2: העברת משקל לצד" lead="מניחים את התינוק על הגב, ומעבירים בעדינות את המשקל לצד אחד." />
        </div>
        <Card padding="md" style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <ProgressBar value={30} label="3 מתוך 10 שיעורים" />
          <ol className="bs-lesson-list">
            <LessonListItem index={1} title="היכרות: למה התהפכות חשובה" durationSec={142} state="done" href="#" />
            <LessonListItem index={2} title="תרגיל 1: הכנה על הגב" durationSec={185} state="done" href="#" />
            <LessonListItem index={3} title="תרגיל 2: העברת משקל לצד" durationSec={240} state="current" href="#" />
            <LessonListItem index={4} title="תרגיל 3: מהבטן לגב" durationSec={205} href="#" />
            <LessonListItem index={5} title="בונוס: הכנה לשלב הזחילה" durationSec={320} state="locked" />
          </ol>
        </Card>
      </Container>
    </div>
  );
}

const meta = {
  title: 'Examples/AppScreens',
  parameters: { bsFlush: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginScreen: Story = { render: () => <Login /> };
export const MyCoursesScreen: Story = { render: () => <MyCourses /> };
export const Lesson: Story = { render: () => <LessonScreen /> };
