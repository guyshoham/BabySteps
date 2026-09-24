import type { Meta, StoryObj } from '@storybook/react-vite';
import { SiteNav } from './SiteNav';

const meta = {
  title: 'Layout/SiteNav',
  component: SiteNav,
  parameters: { bsFlush: true },
  args: {
    logo: { src: '/logo-peach.png', alt: '' },
    title: 'מתחילים בקטן',
    links: [
      { label: 'הקורסים', href: '#courses' },
      { label: 'מי אני', href: '#about' },
      { label: 'המלצות', href: '#reviews' },
    ],
    cta: { label: 'לרכישה', href: '#register' },
  },
} satisfies Meta<typeof SiteNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};
export const BrandOnly: Story = { args: { links: [], cta: undefined } };
