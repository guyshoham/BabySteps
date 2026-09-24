import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonListItem } from './LessonListItem';

function inList(ui: ReactElement) {
  return render(<ol className="bs-lesson-list">{ui}</ol>);
}

describe('LessonListItem', () => {
  it('links to the lesson and shows the duration', () => {
    inList(<LessonListItem title="תרגיל 1: הכנה על הגב" href="/app/lesson/l1" durationSec={185} index={1} />);
    expect(screen.getByRole('link', { name: /תרגיל 1: הכנה על הגב/ })).toHaveAttribute('href', '/app/lesson/l1');
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('a locked lesson is not a link and says it is locked', () => {
    inList(<LessonListItem title="בונוס: הכנה לזחילה" href="/app/lesson/l9" state="locked" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('נעול')).toHaveClass('bs-visually-hidden');
  });

  it('marks the current lesson for assistive tech', () => {
    inList(<LessonListItem title="תרגיל 2" href="/app/lesson/l2" state="current" />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('השיעור הבא')).toBeVisible();
  });

  it('renders an <li> root so the list has only list items as children', () => {
    const { container } = inList(<LessonListItem title="תרגיל 1" href="/app/lesson/l1" />);
    const list = container.querySelector('ol')!;
    expect(list.children).toHaveLength(1);
    expect(list.firstElementChild?.tagName).toBe('LI');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('omits an invalid duration', () => {
    const { container } = inList(<LessonListItem title="תרגיל 3" durationSec={-1} />);
    expect(container.querySelector('.bs-lesson__time')).toBeNull();
  });
});
