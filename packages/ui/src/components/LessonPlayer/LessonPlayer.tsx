import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type MouseEvent,
  type SyntheticEvent,
  type VideoHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';

/** Seconds of playback between two onProgress calls. */
export const PROGRESS_INTERVAL_SEC = 10;
/** Share of the video watched that counts as "completed". */
export const COMPLETE_RATIO = 0.9;

export interface LessonPlayerProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'poster' | 'onProgress'> {
  /** Signed video URL (from /api/video-url). */
  src?: string;
  poster?: string;
  /** Resume position in seconds (progress.lastPositionSec). Applied once metadata loads. */
  startAt?: number;
  /** Current position in seconds. Called about every 10 s of playback, and on pause. */
  onProgress?: (seconds: number) => void;
  /** Called once per src, when 90% is watched or the video ends. */
  onComplete?: () => void;
  /** Class for the outer wrapper. */
  className?: string;
}

/**
 * The lesson video. Fits portrait (9:16) clips to the screen height and reports
 * progress so the app can save it. The ref points at the <video> element.
 */
export const LessonPlayer = forwardRef<HTMLVideoElement, LessonPlayerProps>(function LessonPlayer(
  {
    src,
    poster,
    startAt,
    onProgress,
    onComplete,
    controls = true,
    playsInline = true,
    controlsList = 'nodownload',
    className,
    onLoadedMetadata,
    onTimeUpdate,
    onPause,
    onEnded,
    onContextMenu,
    ...rest
  },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

  const completedRef = useRef(false);
  const lastReportedRef = useRef<number | null>(null);
  const startAppliedRef = useRef(false);

  const applyStart = (video: HTMLVideoElement) => {
    if (startAppliedRef.current) return;
    startAppliedRef.current = true;
    if (!startAt || startAt <= 0) return;
    const { duration } = video;
    if (Number.isFinite(duration) && startAt >= duration) return;
    video.currentTime = startAt;
    lastReportedRef.current = startAt;
  };

  // A new video starts fresh: complete can fire again and startAt applies again.
  useEffect(() => {
    completedRef.current = false;
    lastReportedRef.current = null;
    startAppliedRef.current = false;
    const video = videoRef.current;
    // Metadata may already be there (cached video) before React attached handlers.
    if (video && video.readyState >= 1) applyStart(video);
  }, [src]);

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  };

  const report = (seconds: number) => {
    lastReportedRef.current = seconds;
    onProgress?.(seconds);
  };

  const handleLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    applyStart(event.currentTarget);
    onLoadedMetadata?.(event);
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const { currentTime, duration } = event.currentTarget;
    const last = lastReportedRef.current;
    if (last === null || Math.abs(currentTime - last) >= PROGRESS_INTERVAL_SEC) {
      report(currentTime);
    }
    if (Number.isFinite(duration) && duration > 0 && currentTime / duration >= COMPLETE_RATIO) {
      complete();
    }
    onTimeUpdate?.(event);
  };

  const handlePause = (event: SyntheticEvent<HTMLVideoElement>) => {
    const { currentTime } = event.currentTarget;
    if (currentTime !== lastReportedRef.current) report(currentTime);
    onPause?.(event);
  };

  const handleEnded = (event: SyntheticEvent<HTMLVideoElement>) => {
    complete();
    onEnded?.(event);
  };

  // No "Save video as..." menu. A deterrent only, like controlsList="nodownload".
  const handleContextMenu = (event: MouseEvent<HTMLVideoElement>) => {
    event.preventDefault();
    onContextMenu?.(event);
  };

  return (
    <div className={cx('bs-lesson-player', className)}>
      <video
        {...rest}
        ref={videoRef}
        className="bs-lesson-player__video"
        src={src}
        poster={poster}
        controls={controls}
        playsInline={playsInline}
        controlsList={controlsList}
        preload={rest.preload ?? 'metadata'}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={handleEnded}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
});
