import { useRef, useState, useEffect, useCallback } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface UseCountUpOptions {
  target: number;
  duration?: number;
  delay?: number;
}

export function useCountUp({ target, duration = 2000, delay = 0 }: UseCountUpOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now() + delay;
    const step = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        rafId.current = requestAnimationFrame(step);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    };
    rafId.current = requestAnimationFrame(step);
  }, [target, duration, delay, prefersReducedMotion]);

  useEffect(() => {
    if (isInView) {
      animate();
    }
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isInView, animate]);

  return { ref, displayValue };
}
