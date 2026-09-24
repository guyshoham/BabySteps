import { useEffect, useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { BrandLogo, NavLink } from '../../utils/brand';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { Container } from '../Container/Container';

export interface SiteNavProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  logo?: BrandLogo;
  /** Brand name shown next to the logo. */
  title?: ReactNode;
  links?: NavLink[];
  cta?: { label: ReactNode; href: string };
  /** Accessible name of the menu and its toggle. */
  menuLabel?: string;
}

export function SiteNav({ logo, title, links = [], cta, menuLabel = 'תפריט', className, ...rest }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const hasMenu = links.length > 0 || cta !== undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={cx('bs-sitenav', open && 'bs-sitenav--open', className)} {...rest}>
      <Container width="wide" className="bs-sitenav__bar">
        <a className="bs-sitenav__brand" href={logo?.href ?? '/'}>
          {logo && <img className="bs-sitenav__logo" src={logo.src} alt={logo.alt} />}
          {title && <span className="bs-sitenav__title">{title}</span>}
        </a>
        {hasMenu && (
          <>
            <button
              type="button"
              className="bs-sitenav__toggle"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? 'close' : 'menu'} size={24} />
              <span className="bs-visually-hidden">{menuLabel}</span>
            </button>
            <nav id={menuId} className="bs-sitenav__menu" aria-label={menuLabel}>
              {links.length > 0 && (
                <ul className="bs-sitenav__links">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a className="bs-sitenav__link" href={link.href} onClick={close}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {cta && (
                <Button href={cta.href} size="sm" icon="arrow" onClick={close}>
                  {cta.label}
                </Button>
              )}
            </nav>
          </>
        )}
      </Container>
    </header>
  );
}
