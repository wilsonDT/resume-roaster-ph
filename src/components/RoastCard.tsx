"use client";

import type { RoastResult } from "@/types/roast";

interface RoastCardProps {
  roast: RoastResult;
}

function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 25 ? "#f97316" : "#ef4444";

  const label =
    score >= 75
      ? "Not that bad actually"
      : score >= 50
      ? "Needs work"
      : score >= 25
      ? "This is rough"
      : "Are you okay?";

  return (
    <div className="score-meter">
      <div className="score-number" style={{ color }}>
        {score}
        <span className="score-denom">/100</span>
      </div>
      <div className="score-label">{label}</div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function RoastCard({ roast }: RoastCardProps) {
  return (
    <div className="roast-card-wrapper">
      <div className="roast-card">
        <div className="card-header">
          <span className="card-logo">Resume Roaster PH</span>
        </div>

        <ScoreMeter score={roast.score} />

        <div className="verdict-box">
          <p className="verdict-label">VERDICT</p>
          <p className="verdict-text">"{roast.verdict}"</p>
        </div>

        <div className="burns-section">
          <p className="burns-label">Your roast:</p>
          <ul className="burns-list">
            {roast.burns.map((burn, i) => (
              <li key={i} className="burn-item">
                <span className="burn-dash">—</span>
                <span>{burn}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pampagaan-box">
          <p className="pampagaan-label">One good thing:</p>
          <p className="pampagaan-text">{roast.pampagaan}</p>
        </div>

        <div className="card-footer">
          <a href="https://resume-roaster-ph.vercel.app/" target="_blank" rel="noopener noreferrer">resume-roaster-ph.vercel.app</a>
        </div>
      </div>

    </div>
  );
}
