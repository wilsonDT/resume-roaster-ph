"use client";

import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Reading your resume with zero chill...",
  "Checking if you Googled 'resume tips' last night...",
  "Verifying if any of this is actually true...",
  "Compiling a very long list of complaints...",
  "Counting typos and grammatical crimes...",
  "Roasting every buzzword you wrote...",
  "Still waiting for HR to reply...",
  "Reaching out to your references...",
  "Rating your humility level...",
  "Praying for a decent score...",
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
            <p className="loading-error-title">Oof. Something went wrong.</p>
            <p className="loading-error-msg">{errorMsg}</p>
            <button className="loading-retry-btn" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <p className="loading-label">Getting roasted...</p>
            <div className="loading-progress-track">
              <div
                className={`loading-progress-fill${completing ? " completing" : ""}`}
              />
            </div>
            <p className="loading-message" key={msgIndex}>
              {LOADING_MESSAGES[msgIndex]}
            </p>
            <div className="runner-scene" aria-hidden="true">
              <span className="runner-char">📄</span>
              <span className="runner-obstacle">🔥</span>
              <span className="runner-obstacle runner-obstacle--2">💼</span>
              <div className="runner-ground" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
