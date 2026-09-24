import type { Preview } from '@storybook/react-vite';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import '../src/styles.css';
import './preview.css';
import { BsRoot } from '../src/foundations/BsRoot';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    // The a11y panel runs axe on every story. 'todo' lists violations as warnings in the
    // panel. Stories do not run as tests yet (no @storybook/addon-vitest), so nothing fails.
    a11y: { test: 'todo' },
    viewport: {
      // Most buyers are on phones. Phone-first stories pick "phone" with
      // `globals: { viewport: { value: 'phone' } }` (see StickyCTA). Desktop stays the default.
      options: {
        phone: {
          name: 'Phone (390x844)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        ...MINIMAL_VIEWPORTS,
      },
    },
  },
  decorators: [
    (Story, context) => (
      // Stories set parameters.bsFlush for full-bleed components (Hero, Section, SiteNav).
      <BsRoot className={context.parameters.bsFlush ? 'bs-story' : 'bs-story bs-story--pad'}>
        <Story />
      </BsRoot>
    ),
  ],
};

export default preview;
