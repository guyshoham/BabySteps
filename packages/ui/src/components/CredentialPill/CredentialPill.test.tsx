import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react-vite';
import * as stories from './CredentialPill.stories';

// Smoke test: every story renders with its default args and shows the root class.
const composed = Object.entries(composeStories(stories));

describe('CredentialPill stories', () => {
  it.each(composed)('%s renders', (_name, Story) => {
    const { container } = render(<Story />);
    expect(container.querySelector('.bs-credential-pill')).toBeInTheDocument();
  });
});
