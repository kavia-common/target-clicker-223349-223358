import React from 'react';

/**
 * Generic controls row; not strictly used in overlays but available for reuse.
 */
// PUBLIC_INTERFACE
export default function Controls({
  status,
  isMuted,
  onStart,
  onPause,
  onResume,
  onReset,
  onToggleMute
}) {
  return (
    <div className="controls-inline" role="group" aria-label="Game controls">
      {status === 'idle' && (
        <button className="btn" onClick={onStart} aria-label="Start game">Start</button>
      )}
      {status === 'running' && (
        <button className="btn secondary" onClick={onPause} aria-label="Pause game">Pause</button>
      )}
      {status === 'paused' && (
        <button className="btn" onClick={onResume} aria-label="Resume game">Resume</button>
      )}
      {(status === 'paused' || status === 'running') && (
        <button className="btn ghost" onClick={onReset} aria-label="Reset game">Reset</button>
      )}
      <button
        className="btn ghost"
        onClick={onToggleMute}
        aria-pressed={isMuted}
        aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
