import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Timer from './game/Timer';
import TargetField from './game/TargetField';
import Scoreboard from './game/Scoreboard';
import Controls from './game/Controls';
import useGameEngine from './game/useGameEngine';
import { getBackendUrl, getFeatureFlags } from './utils/env';

// PUBLIC_INTERFACE
function App() {
  /** Root of Click Quest game. Orchestrates views: start, playing, game-over. */
  const featureFlags = useMemo(() => getFeatureFlags(), []);
  const backendUrl = useMemo(() => getBackendUrl(), []);
  const [toast, setToast] = useState(null);

  // Developer/diagnostic state for top scores fetch on game over
  const [topScores, setTopScores] = useState(null);
  const [topScoresLoading, setTopScoresLoading] = useState(false);
  const [topScoresError, setTopScoresError] = useState(null);

  const {
    status, // idle | running | paused | ended
    score,
    highScore,
    timeLeft,
    targets,
    isMuted,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    hitTarget,
    setMuted,
    prefersReducedMotion
  } = useGameEngine({
    gameSeconds: 30,
    spawnIntervalMs: 800,
    bonusChance: 0.15,
    featureFlags
  });

  // Best-effort submit on game end
  useEffect(() => {
    let didCancel = false;

    async function postScore() {
      if (!backendUrl || status !== 'ended') return;
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 3000);

        await fetch(`${backendUrl}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ score })
        }).then(async (r) => {
          clearTimeout(t);
          if (!r.ok) throw new Error('Non-2xx');
          if (!didCancel) {
            setToast('Score submitted!');
            setTimeout(() => setToast(null), 1800);
          }
        }).catch(() => {
          // swallow errors
        });
      } catch {
        // ignore
      }
    }
    postScore();
    return () => { didCancel = true; };
  }, [status, score, backendUrl]);

  // Helper to fetch top scores (non-blocking, optional)
  const fetchTopScores = async () => {
    if (!backendUrl) return;
    setTopScores(null);
    setTopScoresError(null);
    setTopScoresLoading(true);
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${backendUrl}/api/scores/top?limit=10`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Expect an array of score objects; be permissive
      setTopScores(Array.isArray(data) ? data : (data?.scores ?? []));
    } catch (e) {
      setTopScoresError((e && e.message) || 'Failed to fetch top scores');
    } finally {
      setTopScoresLoading(false);
    }
  };

  // Reset top scores panel when leaving game-over
  useEffect(() => {
    if (status !== 'ended') {
      setTopScores(null);
      setTopScoresError(null);
      setTopScoresLoading(false);
    }
  }, [status]);

  return (
    <div className="app-shell">
      <header className="header" role="banner">
        <div className="brand" aria-label="Click Quest">
          <div className="logo" aria-hidden="true" />
          <div className="title">Click Quest</div>
        </div>
        <div className="controls-inline">
          <button
            className="btn ghost"
            onClick={() => setMuted(!isMuted)}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            className="btn ghost"
            onClick={() => window.location.reload()}
            aria-label="Reload page"
            title="Reload"
          >
            ⟳
          </button>
        </div>
      </header>

      <main className="main" role="main">
        <div className="game-card">
          <div className="status-bar" aria-live="polite">
            <div className="status-left">
              <Scoreboard score={score} highScore={highScore} />
            </div>
            <div className="status-center">
              <Timer seconds={timeLeft} warningAt={8} />
            </div>
            <div className="status-right">
              <span className="pill" title={`Animation: ${prefersReducedMotion ? 'Reduced' : 'On'}`}>
                Anim: {prefersReducedMotion ? 'Reduced' : 'On'}
              </span>
            </div>
          </div>

          <TargetField
            status={status}
            targets={targets}
            onHit={hitTarget}
            prefersReducedMotion={prefersReducedMotion}
          />

          {status === 'idle' && (
            <div className="overlay" role="dialog" aria-modal="true" aria-label="Start game">
              <div className="overlay-card">
                <h2 className="overlay-title">Ready to Click?</h2>
                <p className="overlay-sub">Hit as many targets as you can in 30 seconds.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="btn" onClick={startGame} autoFocus aria-label="Start game (Enter)">
                    Start
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => setMuted(!isMuted)}
                    aria-pressed={isMuted}
                    aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                  >
                    {isMuted ? '🔇 Mute' : '🔊 Sound'}
                  </button>
                </div>
                <p className="overlay-sub" style={{ marginTop: 12 }}>
                  Tips: Press Enter to start/restart, Space to pause/resume.
                </p>
              </div>
            </div>
          )}

          {status === 'paused' && (
            <div className="overlay" role="dialog" aria-modal="true" aria-label="Game paused">
              <div className="overlay-card">
                <h2 className="overlay-title">Paused</h2>
                <p className="overlay-sub">Resume when you are ready.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="btn" onClick={resumeGame} aria-label="Resume game (Space)">
                    Resume
                  </button>
                  <button className="btn ghost" onClick={resetGame} aria-label="Reset game">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'ended' && (
            <div className="overlay" role="dialog" aria-modal="true" aria-label="Game over">
              <div className="overlay-card">
                <h2 className="overlay-title">Time’s Up!</h2>
                <p className="overlay-sub">
                  Final score: <strong>{score}</strong> • High score: <strong>{highScore}</strong>
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn" onClick={startGame} autoFocus aria-label="Play again (Enter)">
                    Play Again
                  </button>
                  <button className="btn ghost" onClick={resetGame} aria-label="Reset to start screen">
                    Reset
                  </button>
                  {!!backendUrl && (
                    <button
                      className="btn secondary"
                      onClick={fetchTopScores}
                      aria-label="Fetch top scores from server"
                      disabled={topScoresLoading}
                      title="Fetch top scores"
                    >
                      {topScoresLoading ? 'Loading…' : 'View Top Scores'}
                    </button>
                  )}
                </div>
                {!!backendUrl && (
                  <>
                    <p className="overlay-sub" style={{ marginTop: 12, fontSize: 12 }}>
                      Scores are sent to: {backendUrl.replace(/^https?:\/\//, '')}
                    </p>
                    {topScoresError && (
                      <p className="overlay-sub" style={{ color: '#EF4444', fontSize: 12 }}>
                        Top scores error: {topScoresError}
                      </p>
                    )}
                    {Array.isArray(topScores) && topScores.length > 0 && (
                      <div style={{ marginTop: 10, textAlign: 'left' }} aria-label="Top scores list">
                        <strong>Top Scores</strong>
                        <ol style={{ marginTop: 6 }}>
                          {topScores.map((s, i) => (
                            <li key={i}>
                              {typeof s === 'number' ? s : (s?.score ?? JSON.stringify(s))}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {Array.isArray(topScores) && topScores.length === 0 && !topScoresLoading && !topScoresError && (
                      <p className="overlay-sub" style={{ fontSize: 12 }}>
                        No scores found yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer" role="contentinfo">
        <span>Keyboard: Enter = Start/Restart, Space = Pause/Resume</span>
        <span>•</span>
        <span>Bonus target worth extra points</span>
      </footer>

      {toast && (
        <div aria-live="polite" className="overlay" style={{ pointerEvents: 'none', background: 'transparent' }}>
          <div className="overlay-card" style={{ width: 'auto', padding: '10px 14px' }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
