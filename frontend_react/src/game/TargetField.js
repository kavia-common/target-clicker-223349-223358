import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * TargetField renders the playfield and absolute-positioned targets.
 * Ensures targets stay within bounds and applies smooth animations with
 * prefers-reduced-motion handling.
 */
// PUBLIC_INTERFACE
export default function TargetField({ status, targets, onHit, prefersReducedMotion }) {
  const fieldRef = useRef(null);
  const [bounds, setBounds] = useState({ w: 0, h: 0 });

  const computeBounds = useCallback(() => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    setBounds({ w: rect.width, h: rect.height });
  }, []);

  useEffect(() => {
    computeBounds();
    window.addEventListener('resize', computeBounds);
    return () => window.removeEventListener('resize', computeBounds);
  }, [computeBounds]);

  const isPaused = status === 'paused';
  return (
    <div
      ref={fieldRef}
      className={`field ${isPaused ? 'is-paused' : ''}`}
      role="application"
      aria-label="Target field"
      data-pause-indicator={isPaused ? 'Paused' : ''}
    >
      {targets.map(t => {
        // ensure within bounds with padding
        const pad = 28;
        const x = Math.min(Math.max(t.x * (bounds.w || 1), pad), Math.max(pad, (bounds.w || 0) - pad));
        const y = Math.min(Math.max(t.y * (bounds.h || 1), pad), Math.max(pad, (bounds.h || 0) - pad));
        const style = {
          left: x,
          top: y,
          transition: prefersReducedMotion ? 'none' : 'transform .2s ease, opacity .15s ease',
        };

        return (
          <button
            key={t.id}
            className={`target ${t.type === 'bonus' ? 'bonus' : ''}`}
            style={style}
            onClick={() => onHit(t.id)}
            role="button"
            aria-label={t.type === 'bonus' ? 'Bonus target' : 'Target'}
            tabIndex={status === 'running' ? 0 : -1}
          >
            {t.type === 'bonus' ? '+2' : '+1'}
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {status === 'running' ? 'Game running' : status === 'paused' ? 'Game paused' : status === 'ended' ? 'Game over' : 'Ready'}
      </span>
    </div>
  );
}
