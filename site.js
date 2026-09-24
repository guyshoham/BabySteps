/* Shared script for the marketing pages. Load with <script src="/site.js" defer>. */

// CSS hides .reveal only under .js, so the content stays visible if this file never runs.
// Each page also sets this class inline in <head> to avoid a flash.
document.documentElement.classList.add('js');

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Reveal on scroll (IntersectionObserver) ─────────────────── */
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(el => revealObserver.observe(el));
    }

    /* ── Ripple effect on buttons ────────────────────────────────── */
    if (!reduceMotion) {
        document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const rect   = this.getBoundingClientRect();
                const circle = document.createElement('span');
                circle.classList.add('ripple-circle');
                // position relative to click point
                circle.style.top   = (e.clientY - rect.top) + 'px';
                circle.style.right = (rect.right - e.clientX) + 'px';
                this.appendChild(circle);
                setTimeout(() => circle.remove(), 600);
            });
        });
    }
})();
