import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { BrandLogo } from '../../utils/brand';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Container } from '../Container/Container';

export interface AppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  logo?: BrandLogo;
  title?: ReactNode;
  /** Signed-in student. Omit when signed out. */
  userName?: string;
  onSignOut?: () => void;
  signOutLabel?: string;
}

export function AppHeader({ logo, title, userName, onSignOut, signOutLabel = 'התנתקות', className, ...rest }: AppHeaderProps) {
  return (
    <header className={cx('bs-app-header', className)} {...rest}>
      <Container width="base" className="bs-app-header__inner">
        <a className="bs-app-header__brand" href={logo?.href ?? '/app/my-courses'}>
          {logo && <img className="bs-app-header__logo" src={logo.src} alt={logo.alt} />}
          {title && <span className="bs-app-header__title">{title}</span>}
        </a>
        {(userName || onSignOut) && (
          <div className="bs-app-header__user">
            {userName && (
              <>
                <Avatar name={userName} size="sm" decorative />
                <span className="bs-app-header__name">{userName}</span>
              </>
            )}
            {onSignOut && (
              <Button variant="ghost" size="sm" icon="logout" onClick={onSignOut}>
                {signOutLabel}
              </Button>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}
