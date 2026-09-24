import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type ContainerWidth = 'narrow' | 'base' | 'wide';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** narrow 720px (text, forms), base 1040px, wide 1240px (hero, nav). */
  width?: ContainerWidth;
}

export function Container({ width = 'base', className, ...rest }: ContainerProps) {
  return <div className={cx('bs-container', `bs-container--${width}`, className)} {...rest} />;
}
