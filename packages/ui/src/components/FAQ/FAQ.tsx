import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface FAQItem {
  question: ReactNode;
  answer: ReactNode;
}

export interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  items: FAQItem[];
  /** Index of the item open at first. */
  defaultOpen?: number | null;
}

export function FAQ({ items, defaultOpen = null, className, ...rest }: FAQProps) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className={cx('bs-faq', className)} {...rest}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div key={i} className={cx('bs-faq__item', isOpen && 'bs-faq__item--open')}>
            <h3 className="bs-faq__heading">
              <button
                id={buttonId}
                type="button"
                className="bs-faq__button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.question}</span>
                <Icon name="chevron" size={20} className="bs-faq__chevron" />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="bs-faq__panel" hidden={!isOpen}>
              <div className="bs-faq__answer">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
