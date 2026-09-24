import type { LiHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { formatDuration } from '../../utils/time';
import { Icon } from '../Icon/Icon';

export type LessonState = 'todo' | 'current' | 'done' | 'locked';

export interface LessonListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title: ReactNode;
  /** Lesson number shown in the marker (todo and current states). */
  index?: number;
  /** Length in seconds (Firestore lessons.durationSec). */
  durationSec?: number;
  state?: LessonState;
  /** Ignored when locked. */
  href?: string;
}

const HIDDEN_STATE: Partial<Record<LessonState, string>> = {
  done: 'הושלם',
  locked: 'נעול',
};

export function LessonListItem({ title, index, durationSec, state = 'todo', href, className, ...rest }: LessonListItemProps) {
  const time = formatDuration(durationSec);
  const marker =
    state === 'done' ? <Icon name="check" size={18} />
    : state === 'locked' ? <Icon name="lock" size={18} />
    : index != null ? index
    : <Icon name="play" size={16} />;

  const inner = (
    <>
      <span className="bs-lesson__marker" aria-hidden="true">{marker}</span>
      <span className="bs-lesson__text">
        <span className="bs-lesson__title">{title}</span>
        {state === 'current' && <span className="bs-lesson__state">השיעור הבא</span>}
        {HIDDEN_STATE[state] && <span className="bs-visually-hidden">{HIDDEN_STATE[state]}</span>}
      </span>
      {time && (
        <span className="bs-lesson__time" dir="ltr">
          <Icon name="clock" size={14} />
          {time}
        </span>
      )}
    </>
  );

  const linkable = href !== undefined && state !== 'locked';

  return (
    <li className={cx('bs-lesson', `bs-lesson--${state}`, className)} {...rest}>
      {linkable ? (
        <a className="bs-lesson__row" href={href} aria-current={state === 'current' ? 'step' : undefined}>
          {inner}
        </a>
      ) : (
        <div className="bs-lesson__row" aria-disabled={state === 'locked' || undefined}>
          {inner}
        </div>
      )}
    </li>
  );
}
