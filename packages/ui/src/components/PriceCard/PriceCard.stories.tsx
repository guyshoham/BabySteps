import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceCard } from './PriceCard';
import { Button } from '../Button/Button';

const meta = {
  title: 'Landing/PriceCard',
  component: PriceCard,
  args: {
    title: 'תשלום דרך PayPal',
    description: 'משלמות דרך PayPal ומקבלות מייל עם פרטי גישה, מיד אחרי התשלום.',
    price: '₪175',
    oldPrice: '₪205',
    priceNote: 'תשלום חד-פעמי',
    features: ['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ', 'גישה מיידית, ללא עיכובים'],
    cta: <Button icon="arrow">שלמי וקבלי גישה מיידית</Button>,
  },
} satisfies Meta<typeof PriceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = { render: (args) => <div style={{ maxWidth: 380 }}><PriceCard {...args} /></div> };
export const Featured: Story = {
  args: { featured: true, badge: 'הכי מומלץ' },
  render: (args) => <div style={{ maxWidth: 380, paddingBlockStart: 'var(--space-4)' }}><PriceCard {...args} /></div>,
};
export const SideBySide: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)', maxWidth: 820, paddingBlockStart: 'var(--space-4)' }}>
      <PriceCard {...args} featured badge="הכי מומלץ" />
      <PriceCard
        title="העברה ידנית"
        description="ביט או Paybox, ואז הודעת אישור בווטסאפ."
        price="₪175"
        oldPrice="₪205"
        priceNote="תשלום חד-פעמי"
        features={['גישה מלאה לכל הסרטונים', 'ליווי אישי בווטסאפ']}
        cta={<Button variant="whatsapp">שלחי אישור בווטסאפ</Button>}
      />
    </div>
  ),
};
