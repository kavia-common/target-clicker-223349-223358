import React from 'react';

// PUBLIC_INTERFACE
export default function Timer({ seconds, warningAt = 10 }) {
  /** Displays remaining time as a pill with warning styling when low. */
  const isWarning = seconds <= warningAt;
  return (
    <span
      className={`pill ${isWarning ? 'error' : ''}`}
      aria-live="polite"
      aria-label={`Time left ${seconds} seconds`}
    >
      ⏱ {Math.max(0, Math.ceil(seconds))}s
    </span>
  );
}
