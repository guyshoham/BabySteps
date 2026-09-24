/// <reference types="vite/client" />
// Story images are imported, not served from a static dir, so they also resolve in
// design-sync previews (the converter inlines imported images as data URLs).
// They come straight from the site's assets/ folder, so there is one copy of each.
import aboutPhoto from '../../../assets/about.jpg';
import logoPeach from '../../../assets/logos/logo-peach.png';
import teaserPoster from '../../../assets/videos/rolling-teaser-poster.jpg';

export const storyAssets = { aboutPhoto, logoPeach, teaserPoster };
