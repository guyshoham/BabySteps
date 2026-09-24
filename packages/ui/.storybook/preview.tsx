import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';
import './preview.css';
import { BsRoot } from '../src/foundations/BsRoot';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
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
