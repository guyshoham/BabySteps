import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface VideoFrameProps extends HTMLAttributes<HTMLElement> {
  poster?: string;
  /** Video URL. When set, play swaps the poster for a <video>. */
  src?: string;
  /** Accessible name of the play button. */
  label?: string;
  aspect?: '16/9' | '9/16' | '4/5' | '1/1';
  onPlay?: () => void;
  caption?: ReactNode;
}

export function VideoFrame({
  poster,
  src,
  label = 'הפעלת הסרטון',
  aspect = '16/9',
  onPlay,
  caption,
  className,
  ...rest
}: VideoFrameProps) {
  const [playing, setPlaying] = useState(false);

  const play = () => {
    onPlay?.();
    if (src) setPlaying(true);
  };

  return (
    <figure className={cx('bs-video-frame', className)} {...rest}>
      <div className="bs-video-frame__stage" style={{ aspectRatio: aspect.replace('/', ' / ') }}>
        {playing && src ? (
          <video className="bs-video-frame__video" src={src} poster={poster} controls autoPlay playsInline />
        ) : (
          <>
            {poster ? (
              <img className="bs-video-frame__poster" src={poster} alt="" />
            ) : (
              <div className="bs-video-frame__placeholder" />
            )}
            <button type="button" className="bs-video-frame__play" aria-label={label} onClick={play}>
              <Icon name="play" size={32} />
            </button>
          </>
        )}
      </div>
      {caption && <figcaption className="bs-video-frame__caption">{caption}</figcaption>}
    </figure>
  );
}
