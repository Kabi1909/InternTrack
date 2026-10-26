import { useEffect } from 'react';

const revealSelector = [
  '.hero-copy > *',
  '.hero-art',
  '.section-heading',
  '.page-heading',
  '.about-mission',
  '.about-lead',
  '.card',
  '.job-card',
  '.category-card',
  '.step',
  '.benefit-panel',
  '.cta-panel',
  '.auth-story > *',
  '.auth-form-wrap > :not(form)',
  '.field',
  '.form-actions',
  '.notification-item',
  '.interview-card',
  '.empty-state',
  '.data-table tbody tr',
  '.calendar-toolbar',
  '.calendar-grid',
].join(', ');

// Progressive enhancement: content stays visible if animation is unavailable.
export function usePageMotion(pathname) {
  useEffect(() => {
    if (!window.IntersectionObserver || !Element.prototype.animate) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet();
    const running = new Map();
    let frame;

    const stopAnimations = () => {
      running.forEach((animation) => animation.cancel());
      running.clear();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0;
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          if (preference.matches || target.contains(document.activeElement)) return;

          // Move only self-contained elements; forms and modal hosts remain fixed.
          const canLift =
            target.matches(
              '.job-card, .category-card, .step, .hero-copy > *, .section-heading, .page-heading',
            ) && !target.querySelector('[role="dialog"]');
          const frames = canLift
            ? [
                { opacity: 0.65, translate: '0 20px' },
                { opacity: 1, translate: '0 0' },
              ]
            : [{ opacity: 0.8 }, { opacity: 1 }];
          const animation = target.animate(frames, {
            duration: 650,
            delay: Math.min(stagger++ * 75, 225),
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'backwards',
          });
          running.set(target, animation);
          animation.onfinish = () => running.delete(target);
        });
      },
      { threshold: 0.05 },
    );

    const scan = () => {
      const main = document.getElementById('main-content');
      main?.querySelectorAll(revealSelector).forEach((element) => {
        if (seen.has(element) || element.closest('[role="dialog"]')) return;
        seen.add(element);
        // Avoid layering fades on both a card and every field inside it.
        if (element.parentElement.closest(revealSelector)) return;
        observer.observe(element);
      });
    };

    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    const root = document.getElementById('root');
    if (root) mutations.observe(root, { childList: true, subtree: true });
    scan();

    const revealFocused = (event) => {
      running.forEach((animation, element) => {
        if (element.contains(event.target)) {
          animation.cancel();
          running.delete(element);
        }
      });
    };
    preference.addEventListener('change', stopAnimations);
    document.addEventListener('focusin', revealFocused);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      stopAnimations();
      preference.removeEventListener('change', stopAnimations);
      document.removeEventListener('focusin', revealFocused);
    };
  }, [pathname]);
}
