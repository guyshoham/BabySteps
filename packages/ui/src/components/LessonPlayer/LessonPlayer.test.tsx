import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { LessonPlayer } from './LessonPlayer';

/** jsdom does not play media. Give the element a writable time and a duration. */
function fakeMedia(video: HTMLVideoElement, duration: number) {
  let time = 0;
  Object.defineProperty(video, 'duration', { configurable: true, get: () => duration });
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    get: () => time,
    set: (value: number) => {
      time = value;
    },
  });
  return {
    play(to: number) {
      time = to;
      fireEvent.timeUpdate(video);
    },
  };
}

function setup(props: Parameters<typeof LessonPlayer>[0] = {}) {
  const { container, rerender } = render(<LessonPlayer src="/lesson.mp4" {...props} />);
  const video = container.querySelector('video')!;
  return { video, rerender };
}

describe('LessonPlayer', () => {
  it('renders a protected, inline video with controls and forwards the ref', () => {
    const ref = createRef<HTMLVideoElement>();
    const { container } = render(<LessonPlayer ref={ref} src="/lesson.mp4" poster="/poster.jpg" />);
    const video = container.querySelector('video')!;
    expect(ref.current).toBe(video);
    expect(video).toHaveAttribute('src', '/lesson.mp4');
    expect(video).toHaveAttribute('poster', '/poster.jpg');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('controlslist', 'nodownload');
    expect(video).toHaveClass('bs-lesson-player__video');
  });

  it('seeks to startAt when metadata loads', () => {
    const { video } = setup({ startAt: 42 });
    fakeMedia(video, 120);
    fireEvent.loadedMetadata(video);
    expect(video.currentTime).toBe(42);
  });

  it('ignores a startAt past the end', () => {
    const { video } = setup({ startAt: 500 });
    fakeMedia(video, 120);
    fireEvent.loadedMetadata(video);
    expect(video.currentTime).toBe(0);
  });

  it('calls onComplete once, when 90% is watched', () => {
    const onComplete = vi.fn();
    const { video } = setup({ onComplete });
    const media = fakeMedia(video, 100);
    media.play(89);
    expect(onComplete).not.toHaveBeenCalled();
    media.play(90);
    expect(onComplete).toHaveBeenCalledTimes(1);
    media.play(95);
    fireEvent.ended(video);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete on ended even below 90%', () => {
    const onComplete = vi.fn();
    const { video } = setup({ onComplete });
    fakeMedia(video, 100);
    fireEvent.ended(video);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('can complete again after src changes', () => {
    const onComplete = vi.fn();
    const { video, rerender } = setup({ onComplete });
    fakeMedia(video, 100).play(95);
    rerender(<LessonPlayer src="/next.mp4" onComplete={onComplete} />);
    fakeMedia(video, 100).play(95);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it('reports progress about every 10 seconds, and on pause', () => {
    const onProgress = vi.fn();
    const { video } = setup({ onProgress });
    const media = fakeMedia(video, 300);
    media.play(0.25);
    media.play(4);
    media.play(9);
    media.play(10.5);
    media.play(15);
    media.play(21);
    expect(onProgress.mock.calls.map(([s]) => s)).toEqual([0.25, 10.5, 21]);
    media.play(24);
    fireEvent.pause(video);
    expect(onProgress).toHaveBeenLastCalledWith(24);
  });

  it('counts the 10 seconds from startAt', () => {
    const onProgress = vi.fn();
    const { video } = setup({ onProgress, startAt: 60 });
    const media = fakeMedia(video, 300);
    fireEvent.loadedMetadata(video);
    media.play(61);
    expect(onProgress).not.toHaveBeenCalled();
    media.play(70);
    expect(onProgress).toHaveBeenCalledWith(70);
  });

  it('still calls handlers passed by the caller', () => {
    const onTimeUpdate = vi.fn();
    const onEnded = vi.fn();
    const { video } = setup({ onTimeUpdate, onEnded });
    fakeMedia(video, 100).play(5);
    fireEvent.ended(video);
    expect(onTimeUpdate).toHaveBeenCalledTimes(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});
