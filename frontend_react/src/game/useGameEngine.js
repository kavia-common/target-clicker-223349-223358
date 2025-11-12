import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// IDs
let _idCounter = 0;
const nextId = () => (++_idCounter).toString();

/**
 * PUBLIC_INTERFACE
 * useGameEngine manages game lifecycle, timer, spawn loop, targets, score, and a11y keys.
 * - States: idle -> running -> paused -> ended
 * - High score persisted in localStorage
 * - Spawns normal and occasional bonus targets
 * - Keyboard: Enter to start/restart, Space to pause/resume
 */
export default function useGameEngine({
  gameSeconds = 30,
  spawnIntervalMs = 900,
  bonusChance = 0.1,
  featureFlags = {}
} = {}) {
  const [status, setStatus] = useState('idle'); // idle | running | paused | ended
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const raw = localStorage.getItem('cq_high_score');
    return raw ? parseInt(raw, 10) || 0 : 0;
  });
  const [timeLeft, setTimeLeft] = useState(gameSeconds);
  const [targets, setTargets] = useState([]);
  const [isMuted, setMuted] = useState(false);

  const reducedMotion = useMemo(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch { return false; }
  }, []);

  const prefersReducedMotion = reducedMotion;

  // audio (best-effort, no external deps)
  const audioRef = useRef(null);
  useEffect(() => {
    // Optional: file may not exist; keep resilient.
    const audio = new Audio('/assets/sfx/click.mp3');
    audio.volume = 0.25;
    audioRef.current = audio;
  }, []);

  // spawn loop
  const spawnTimer = useRef(null);
  const tickTimer = useRef(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setScore(0);
    setTargets([]);
    setTimeLeft(gameSeconds);
  }, [gameSeconds]);

  const startGame = useCallback(() => {
    setScore(0);
    setTargets([]);
    setTimeLeft(gameSeconds);
    setStatus('running');
  }, [gameSeconds]);

  const pauseGame = useCallback(() => setStatus('paused'), []);
  const resumeGame = useCallback(() => setStatus('running'), []);
  const endGame = useCallback(() => setStatus('ended'), []);

  const hitTarget = useCallback((id) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(prev => {
      const target = targets.find(t => t.id === id);
      const inc = target?.type === 'bonus' ? 2 : 1;
      const next = prev + inc;
      if (!isMuted && audioRef.current) {
        try { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); } catch {}
      }
      return next;
    });
  }, [targets, isMuted]);

  // update high score on score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cq_high_score', String(score));
    }
  }, [score, highScore]);

  // difficulty curve (optional)
  const dynamicSpawnMs = useMemo(() => {
    if (featureFlags?.dynamicSpawn !== false) {
      // get faster as time decreases: linear from spawnIntervalMs to 60% of it
      const progress = 1 - (timeLeft / gameSeconds);
      const minFactor = 0.6;
      const f = spawnIntervalMs * (1 - (1 - minFactor) * progress);
      return Math.max(300, Math.floor(f));
    }
    return spawnIntervalMs;
  }, [featureFlags, timeLeft, gameSeconds, spawnIntervalMs]);

  // manage timers based on status
  useEffect(() => {
    // clear previous timers
    if (spawnTimer.current) { clearInterval(spawnTimer.current); spawnTimer.current = null; }
    if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }

    if (status === 'running') {
      // spawn interval
      spawnTimer.current = setInterval(() => {
        setTargets(prev => {
          const isBonus = Math.random() < bonusChance;
          const target = {
            id: nextId(),
            x: Math.random(), // relative 0..1
            y: Math.random(),
            type: isBonus ? 'bonus' : 'normal'
          };
          // cap max targets to avoid clutter
          const maxTargets = 8;
          const next = [...prev, target].slice(-maxTargets);
          return next;
        });
      }, dynamicSpawnMs);

      // countdown interval
      tickTimer.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(tickTimer.current);
            clearInterval(spawnTimer.current);
            tickTimer.current = null;
            spawnTimer.current = null;
            setStatus('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (spawnTimer.current) { clearInterval(spawnTimer.current); spawnTimer.current = null; }
      if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }
    };
  }, [status, dynamicSpawnMs, bonusChance]);

  // keyboard a11y: Enter to start/restart; Space to pause/resume
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') {
        if (status === 'idle' || status === 'ended') {
          e.preventDefault();
          startGame();
        }
      }
      if (e.key === ' ' || e.code === 'Space') {
        if (status === 'running') {
          e.preventDefault();
          pauseGame();
        } else if (status === 'paused') {
          e.preventDefault();
          resumeGame();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, startGame, pauseGame, resumeGame]);

  return {
    status,
    score,
    highScore,
    timeLeft,
    targets,
    isMuted,
    startGame,
    pauseGame,
    resumeGame,
    resetGame: reset,
    hitTarget,
    setMuted,
    prefersReducedMotion
  };
}
