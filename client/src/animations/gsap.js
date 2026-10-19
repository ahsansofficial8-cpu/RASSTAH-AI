import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
  // Graceful fallback for smooth scrolling in modern browser
  if (typeof window !== 'undefined') {
    document.documentElement.style.scrollBehavior = 'smooth';
  }
  return null;
}

export function getLenis() { return null; }
export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fadeUpStagger(targets, { stagger = 0.08, y = 40, duration = 0.7, trigger, start = 'top 85%' } = {}) {
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: trigger || targets[0] || targets,
        start,
        toggleActions: 'play reverse play reverse',
      },
    }
  );
}
