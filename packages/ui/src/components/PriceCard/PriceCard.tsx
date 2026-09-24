import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';

export interface PriceCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** Display string with currency, e.g. "₪175". */
  price: string;
  /** Crossed-out earlier price. */
  oldPrice?: string;
  /** Small line under the price, e.g. "תשלום חד-פעמי". */
  priceNote?: ReactNode;
  description?: ReactNode;
  features?: ReactNode[];
  /** Usually a full-width Button. */
  cta?: ReactNode;
  /** Brand border, larger shadow, peach header. Use for the recommended option. */
  featured?: boolean;
  /** Floating badge on top, e.g. "הכי מומלץ". */
  badge?: ReactNode;
}

export function PriceCard({
  title,
  price,
  oldPrice,
  priceNote,
  description,
  features = [],
  cta,
  featured = false,
  badge,
  className,
  ...rest
}: PriceCardProps) {
  return (
    <Card as="article" padding="none" className={cx('bs-price-card', featured && 'bs-price-card--featured', className)} {...rest}>
      {badge && (
        <Badge variant="highlight" icon="star" className="bs-price-card__badge">
          {badge}
        </Badge>
      )}
      <div className="bs-price-card__header">
        <h3 className="bs-price-card__title">{title}</h3>
        {description && <p className="bs-price-card__desc">{description}</p>}
        <p className="bs-price-card__price">
          <span className="bs-price-card__amount">{price}</span>
          {oldPrice && (
            <s className="bs-price-card__old">
              <span className="bs-visually-hidden">מחיר קודם: </span>
              {oldPrice}
            </s>
          )}
        </p>
        {priceNote && <p className="bs-price-card__note">{priceNote}</p>}
      </div>
      {features.length > 0 && (
        <ul className="bs-price-card__features">
          {features.map((feature, i) => (
            <li key={i}>
              <Icon name="check" size={16} className="bs-price-card__check" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      {cta && <div className="bs-price-card__cta">{cta}</div>}
    </Card>
  );
}
