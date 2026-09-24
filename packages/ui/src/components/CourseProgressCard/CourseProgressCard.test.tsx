import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseProgressCard } from './CourseProgressCard';

describe('CourseProgressCard', () => {
  it('computes progress from lessons and links to the course', () => {
    render(<CourseProgressCard title="קורס התהפכות" lessonsDone={5} lessonsTotal={10} href="/app/course/rolling" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/app/course/rolling');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('להמשך צפייה')).toBeInTheDocument();
  });

  it('shows 0% and a start label when there are no lessons', () => {
    render(<CourseProgressCard title="קורס חדש" lessonsDone={0} lessonsTotal={0} href="/app/course/new" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('להתחלת הקורס')).toBeInTheDocument();
  });

  it('marks a finished course and never shows more done than total', () => {
    render(<CourseProgressCard title="קורס התהפכות" lessonsDone={12} lessonsTotal={10} href="/x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('הושלם')).toBeInTheDocument();
    expect(screen.getByText('10 מתוך 10 שיעורים')).toBeInTheDocument();
  });

  it('shows a fallback instead of a broken image', () => {
    const { container } = render(<CourseProgressCard title="קורס" lessonsDone={1} lessonsTotal={4} href="/x" />);
    expect(container.querySelector('img')).toBeNull();
  });
});
