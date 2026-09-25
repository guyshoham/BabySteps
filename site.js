/* Shared script for the marketing pages. Load with <script src="/site.js" defer>.
   Motion rules: docs/design/2026-09-26-art-direction.md, section 5.
   No scroll listeners here: reveals use an IntersectionObserver. */

// CSS hides .reveal only under .js, so the content stays visible if this file never runs.
// Each page also sets this class inline in <head> to avoid a flash.
document.documentElement.classList.add('js');

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Reveal on scroll (IntersectionObserver) ─────────────────── */
    // Each .reveal element fades in and rises by --rise once, the first time
    // it enters the screen. Under reduced motion it is visible at once.
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('visible'));
        return;
    }
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
})();
