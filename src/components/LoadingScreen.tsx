"use client";

import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Binabasa ng AI ang iyong mga excuses...",
  "Hinihintay pa si HR...",
  "Checking kung nag-Google ka ng 'resume tips'...",
  "Tinitingnan kung totoo lahat ng sinabi mo...",
  "Kinukwento ng AI sa mga kaibigan niya ang resume mo...",
  "Nagsu-sulat ng mahabang listahan ng reklamo...",
  "Kinakausap ng AI ang mga dating boss mo...",
  "Pinapalabas ng lahat ng red flags...",
  "Nagbibilang ng typos at grammatical errors...",
  "Nakikiusap sa Diyos para sa magandang score...",
];

interface LoadingScreenProps {
  completing: boolean;
  hasError: boolean;
  errorMsg: string;
  onRetry: () => void;
}

export default function LoadingScreen({
  completing,
  hasError,
  errorMsg,
  onRetry,
}: LoadingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  );

  useEffect(() => {
    if (hasError || completing) return;
    const id = setInterval(() => {
      setMsgIndex((prev) => {
        let next = Math.floor(Math.random() * LOADING_MESSAGES.length);
        while (next === prev) {
          next = Math.floor(Math.random() * LOADING_MESSAGES.length);
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, [hasError, completing]);

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-inner">
        {hasError ? (
          <div className="loading-error">
            <p className="loading-error-title">Ay nako. May nangyari.</p>
            <p className="loading-error-msg">{errorMsg}</p>
            <button className="loading-retry-btn" onClick={onRetry}>
              Subukan ulit
            </button>
          </div>
        ) : (
          <>
            <p className="loading-label">Inii-roast ka na...</p>
            <div className="loading-progress-track">
              <div
                className={`loading-progress-fill${completing ? " completing" : ""}`}
              />
            </div>
            <p className="loading-message" key={msgIndex}>
              {LOADING_MESSAGES[msgIndex]}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
