import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CelebrationEvent } from '@/lib/celebration';
import { CELEBRATION_CONFIGS } from '@/lib/celebration';

interface Props {
  event: CelebrationEvent | null;
}

export const CelebrationOverlay = ({ event }: Props) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (event) {
      setLeaving(false);
      setVisible(true);
      leaveTimer.current = setTimeout(() => setLeaving(true), 3000);
      hideTimer.current = setTimeout(() => setVisible(false), 3600);
    } else {
      setVisible(false);
      setLeaving(false);
    }

    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [event]);

  if (!visible || !event) return null;

  const config = CELEBRATION_CONFIGS[event];

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        opacity: leaving ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: config.gradient,
          borderRadius: '1.25rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '300px',
          maxWidth: '420px',
          transform: leaving ? 'translateY(12px) scale(0.95)' : 'translateY(0) scale(1)',
          transition: 'transform 0.5s ease',
          animation: 'celebration-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        {/* Shimmer overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.25rem',
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'celebration-shimmer 1.8s ease infinite',
          }}
        />

        <span style={{ fontSize: '2.75rem', lineHeight: 1, flexShrink: 0 }}>
          {config.emoji}
        </span>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              textShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            {config.title}
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.875rem',
              marginTop: '0.2rem',
              lineHeight: 1.4,
            }}
          >
            {config.subtitle}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
