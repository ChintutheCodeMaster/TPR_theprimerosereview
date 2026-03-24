import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { CelebrationEvent } from '@/lib/celebration';
import { CELEBRATION_CONFIGS } from '@/lib/celebration';

const DISMISS_DELAY = 3800;

export const useCelebration = () => {
  const [activeEvent, setActiveEvent] = useState<CelebrationEvent | null>(null);

  const celebrate = useCallback((event: CelebrationEvent) => {
    const { confettiColors } = CELEBRATION_CONFIGS[event];

    // Central burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: confettiColors,
      ticks: 220,
    });

    // Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 110,
        angle: 60,
        origin: { y: 0.55, x: 0.2 },
        colors: confettiColors,
        ticks: 160,
      });
    }, 180);

    // Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 110,
        angle: 120,
        origin: { y: 0.55, x: 0.8 },
        colors: confettiColors,
        ticks: 160,
      });
    }, 360);

    setActiveEvent(event);
    setTimeout(() => setActiveEvent(null), DISMISS_DELAY);
  }, []);

  return { celebrate, activeEvent };
};
