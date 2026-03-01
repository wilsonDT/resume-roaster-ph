"use client";

import { useRef } from "react";
import type { RoastResult } from "@/types/roast";

interface RoastCardProps {
  roast: RoastResult;
}

function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 25 ? "#f97316" : "#ef4444";

  const label =
    score >= 75
      ? "Not that bad actually 👏"
      : score >= 50
      ? "Needs work, but okay sige 😬"
      : score >= 25
      ? "Grabe, this is rough... 💀"
      : "Jusko. Are you okay? 😵";

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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const text = `Resume Score: ${roast.score}/100\n\n"${roast.verdict}"\n\nGet your resume roasted too at resume-roaster.ph 🔥`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard! Share it anywhere 🔥");
    }
  };

  return (
    <div className="roast-card-wrapper">
      <div className="roast-card" ref={cardRef}>
        {/* Header */}
        <div className="card-header">
          <span className="card-logo">🔥 Resume Roaster PH</span>
        </div>

        {/* Score */}
        <ScoreMeter score={roast.score} />

        {/* Verdict */}
        <div className="verdict-box">
          <p className="verdict-label">VERDICT</p>
          <p className="verdict-text">"{roast.verdict}"</p>
        </div>

        {/* Burns */}
        <div className="burns-section">
          <p className="burns-label">Here's your roast:</p>
          <ul className="burns-list">
            {roast.burns.map((burn, i) => (
              <li key={i} className="burn-item">
                <span className="burn-icon">🔥</span>
                <span>{burn}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pampagaan */}
        <div className="pampagaan-box">
          <p className="pampagaan-label">✨ But okay, something's actually slay:</p>
          <p className="pampagaan-text">{roast.pampagaan}</p>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <span>resume-roaster.ph</span>
        </div>
      </div>

      {/* Share button outside card so it's not in screenshot */}
      <button className="share-btn" onClick={handleShare}>
        Share this 📤
      </button>
    </div>
  );
}
