import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LessonPlayer } from './LessonPlayer';
import { storyAssets } from '../../../.storybook/assets';

// Only the poster is used here. The real lesson videos are private (R2 signed URLs),
// and inlining a sample mp4 would bloat the design-sync previews.
const meta = {
  title: 'App/LessonPlayer',
  component: LessonPlayer,
  args: { poster: storyAssets.teaserPoster },
} satisfies Meta<typeof LessonPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Portrait: Story = {};

export const InNarrowColumn: Story = {
  render: (args) => (
    <div style={{ maxWidth: 280, marginInline: 'auto' }}>
      <LessonPlayer {...args} />
    </div>
  ),
};

export const WithProgressLog: Story = {
  render: (args) => {
    const [log, setLog] = useState<string[]>([]);
    return (
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <LessonPlayer
          {...args}
          onProgress={(s) => setLog((l) => [...l, `נשמר מיקום: ${Math.round(s)} שניות`])}
          onComplete={() => setLog((l) => [...l, 'השיעור הושלם'])}
        />
        <ul style={{ textAlign: 'center', color: 'var(--color-ink-muted)' }}>
          {log.length === 0 ? <li>עוד לא נשמרה התקדמות</li> : log.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </div>
    );
  },
};
