import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoFrame } from './VideoFrame';

describe('VideoFrame', () => {
  it('calls onPlay when the play button is clicked', async () => {
    const onPlay = vi.fn();
    render(<VideoFrame poster="/poster.jpg" onPlay={onPlay} />);
    await userEvent.click(screen.getByRole('button', { name: 'הפעלת הסרטון' }));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('swaps to a video with controls when src is set', async () => {
    const { container } = render(<VideoFrame poster="/poster.jpg" src="/teaser.mp4" />);
    expect(container.querySelector('video')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'הפעלת הסרטון' }));
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', '/teaser.mp4');
    expect(video).toHaveAttribute('controls');
  });

  it('shows a placeholder, not a broken image, without a poster', () => {
    const { container } = render(<VideoFrame />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.bs-video-frame__placeholder')).toBeInTheDocument();
  });
});
