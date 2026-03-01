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

function ShareModal({ roast, onClose }: { roast: RoastResult; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = shareText(roast);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the textarea
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ text });
      onClose();
    } catch {
      // user cancelled or not supported — stay open
    }
  }

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="share-modal-header">
          <p className="share-modal-title">Share your roast</p>
          <button className="share-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <textarea className="share-modal-text" readOnly value={text} rows={4} />
        <div className="share-modal-actions">
          <button className="share-copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy text"}
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button className="share-native-btn" onClick={handleNativeShare}>
              Share...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoastCard({ roast }: RoastCardProps) {
  const [showModal, setShowModal] = useState(false);

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
          <span>resume-roaster.ph</span>
        </div>
      </div>

      <button className="share-btn" onClick={() => setShowModal(true)}>
        Share
      </button>

      {showModal && <ShareModal roast={roast} onClose={() => setShowModal(false)} />}
    </div>
  );
}
