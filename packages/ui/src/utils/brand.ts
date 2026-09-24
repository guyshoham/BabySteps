import type { ReactNode } from 'react';

export interface BrandLogo {
  src: string;
  alt: string;
  /** Where the logo links to. Defaults to "/". */
  href?: string;
}

export interface NavLink {
  label: ReactNode;
  href: string;
}
