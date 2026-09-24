import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureSteps } from './FeatureSteps';

describe('FeatureSteps', () => {
  it('renders an ordered list with one item per step', () => {
    render(
      <FeatureSteps
        steps={[
          { title: '10 סרטוני הדרכה', text: 'תרגילים מפורטים.' },
          { title: 'ליווי אישי בווטסאפ', badge: 'הכי שווה' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('1');
    expect(items[1]).toHaveTextContent('הכי שווה');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<FeatureSteps steps={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
