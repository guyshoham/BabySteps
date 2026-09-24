import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { toneClass } from '../../utils/tone';
import type { BrandLogo, NavLink } from '../../utils/brand';
import { Icon, type IconName } from '../Icon/Icon';
import { Container } from '../Container/Container';

export interface SocialLink {
  /** Accessible name, e.g. "WhatsApp". */
  label: string;
  href: string;
  icon: IconName;
}

export interface FooterProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  logo?: BrandLogo;
  title?: ReactNode;
  tagline?: ReactNode;
  links?: NavLink[];
  social?: SocialLink[];
  /** Copyright line. */
  note?: ReactNode;
}

export function Footer({ logo, title, tagline, links = [], social = [], note, className, ...rest }: FooterProps) {
  return (
    <footer className={cx('bs-footer', toneClass('cocoa'), className)} {...rest}>
      <Container width="base" className="bs-footer__inner">
        {(logo || title || tagline) && (
          <div className="bs-footer__brand">
            {logo && <img className="bs-footer__logo" src={logo.src} alt={logo.alt} />}
            {title && <p className="bs-footer__title">{title}</p>}
            {tagline && <p className="bs-footer__tagline">{tagline}</p>}
          </div>
        )}
        {links.length > 0 && (
          <nav aria-label="קישורים">
            <ul className="bs-footer__links">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {social.length > 0 && (
          <ul className="bs-footer__social">
            {social.map((item) => (
              <li key={item.href}>
                <a href={item.href} aria-label={item.label} target="_blank" rel="noopener noreferrer">
                  <Icon name={item.icon} size={20} />
                </a>
              </li>
            ))}
          </ul>
        )}
        {note && <p className="bs-footer__note">{note}</p>}
      </Container>
    </footer>
  );
}
