/// <reference types="vite/client" />
// Story images are imported, not served from public/, so they also resolve in
// design-sync previews (the converter inlines imported images as data URLs).
import aboutPhoto from './public/about.jpg';
import logoPeach from './public/logo-peach.png';
import teaserPoster from './public/rolling-teaser-poster.jpg';

export const storyAssets = { aboutPhoto, logoPeach, teaserPoster };
