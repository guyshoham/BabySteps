import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';
import { storyAssets } from '../../../.storybook/assets';

const meta = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: { bsFlush: true },
  args: {
    logo: { src: storyAssets.logoPeach, alt: 'מתחילים בקטן' },
    title: 'ירדן שוהם · מתחילים בקטן',
    tagline: 'מלווה התפתחותית · קורסים דיגיטליים לתינוקות',
    social: [
      { label: 'WhatsApp', href: 'https://wa.me/972542366243', icon: 'whatsapp' },
      { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    ],
    note: '© 2026 ירדן שוהם · כל הזכויות שמורות',
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLinks: Story = {
  args: {
    links: [
      { label: 'הקורסים', href: '#courses' },
      { label: 'מי אני', href: '#about' },
      { label: 'תנאי שימוש', href: '/terms' },
    ],
  },
};
