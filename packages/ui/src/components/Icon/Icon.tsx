import type { ReactNode, SVGProps } from 'react';
import { cx } from '../../utils/cx';

const paths = {
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: (
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  // Points left: "forward" in RTL.
  arrow: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z" />
      <path d="M9.5 9.2c0 2.9 2.4 5.3 5.3 5.3l1-1.4-2-1-.9.7a3.6 3.6 0 0 1-1.7-1.7l.7-.9-1-2z" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  baby: (
    <>
      <circle cx="12" cy="12.5" r="8" />
      <circle cx="9.5" cy="11.5" r="0.7" fill="currentColor" />
      <circle cx="14.5" cy="11.5" r="0.7" fill="currentColor" />
      <path d="M9.6 15.2a3.4 3.4 0 0 0 4.8 0M12 4.5c1.4 0 2.1.9 2.1 1.9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  logout: <path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h9" />,
  sparkle: <path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" />,
  video: (
    <>
      <rect x="3.5" y="6" width="12" height="12" rx="2" />
      <path d="M15.5 10.5l5-3v9l-5-3" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Width and height in px. */
  size?: number;
  /** Accessible name. Leave empty for decorative icons. */
  label?: string;
}

export function Icon({ name, size = 20, label, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={cx('bs-icon', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
