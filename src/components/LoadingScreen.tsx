"use client";

import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "The AI is reading your excuses...",
  "Checking if you Googled 'resume tips' last night...",
  "Verifying if any of this is actually true...",
  "The AI is telling its friends about your resume, grabe...",
  "Compiling a very long list of complaints...",
  "Reaching out to your references, charot...",
  "Counting typos and grammatical crimes...",
  "Roasting every buzzword you wrote, lods...",
  "Still waiting for HR to reply, sus...",
  "Praying for a decent score, sana all...",
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
            <p className="loading-error-title">Oof. Something went wrong, grabe.</p>
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
          </>
        )}
      </div>
    </div>
  );
}
