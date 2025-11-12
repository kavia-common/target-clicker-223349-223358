import React from 'react';

// PUBLIC_INTERFACE
export default function Scoreboard({ score, highScore }) {
  /** Shows current score and high score in themed pills. */
  return (
    <>
      <span className="pill" aria-label={`Score ${score}`}>Score: {score}</span>
      <span className="pill accent" aria-label={`High score ${highScore}`}>High: {highScore}</span>
    </>
  );
}
