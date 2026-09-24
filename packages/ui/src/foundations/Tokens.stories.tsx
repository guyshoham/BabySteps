import type { Meta, StoryObj } from '@storybook/react-vite';

const colors = [
  'color-ink', 'color-ink-soft', 'color-ink-muted', 'color-brand-700', 'color-brand-600',
  'color-brand-500', 'color-accent', 'color-whatsapp', 'color-success', 'color-warning', 'color-error',
];
const surfaces = [
  'surface-cream', 'surface-card', 'surface-peach', 'surface-mint', 'surface-sky', 'surface-blush', 'surface-cocoa',
];
const radii = ['radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-pill'];
const shadows = ['shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-brand'];

function Swatch({ token }: { token: string }) {
  return (
    <div style={{ width: 112, fontSize: 12 }}>
      <div
        style={{
          height: 56,
          borderRadius: 'var(--radius-md)',
          background: `var(--${token})`,
          boxShadow: 'inset 0 0 0 1px var(--color-border)',
        }}
      />
      <code dir="ltr" style={{ display: 'block', marginTop: 6 }}>--{token}</code>
    </div>
  );
}

function TokenSheet() {
  const row = { display: 'flex', flexWrap: 'wrap' as const, gap: 16, marginBottom: 32 };
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>צבעים</h2>
      <div style={row}>{colors.map((t) => <Swatch key={t} token={t} />)}</div>
      <h2 style={{ marginBottom: 16 }}>משטחים</h2>
      <div style={row}>{surfaces.map((t) => <Swatch key={t} token={t} />)}</div>
      <h2 style={{ marginBottom: 16 }}>טיפוגרפיה</h2>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-display)', color: 'var(--color-brand-700)' }}>כותרת ראשית</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h2)', color: 'var(--color-brand-700)' }}>כותרת סקשן</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', color: 'var(--color-brand-700)' }}>כותרת כרטיס</p>
        <p style={{ fontSize: 'var(--text-lead)', color: 'var(--color-ink-soft)' }}>טקסט מוביל, 18 פיקסלים</p>
        <p>טקסט רגיל, 16 פיקסלים, גובה שורה 1.7</p>
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-ink-muted)' }}>טקסט קטן, 13 פיקסלים</p>
      </div>
      <h2 style={{ marginBottom: 16 }}>פינות וצללים</h2>
      <div style={row}>
        {radii.map((t) => (
          <div key={t} style={{ width: 96, height: 64, background: 'var(--surface-peach)', borderRadius: `var(--${t})`, display: 'grid', placeItems: 'center', fontSize: 12 }} dir="ltr">{t}</div>
        ))}
      </div>
      <div style={row}>
        {shadows.map((t) => (
          <div key={t} style={{ width: 128, height: 72, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: `var(--${t})`, display: 'grid', placeItems: 'center', fontSize: 12 }} dir="ltr">{t}</div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: TokenSheet,
} satisfies Meta<typeof TokenSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sheet: Story = {};
