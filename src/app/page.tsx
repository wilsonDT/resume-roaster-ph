"use client";

import { useState, useRef } from "react";
import type { RoastResult } from "@/types/roast";
import RoastCard from "@/components/RoastCard";
import LoadingScreen from "@/components/LoadingScreen";

type Status = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [completing, setCompleting] = useState(false);
  const [roast, setRoast] = useState<RoastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrorMsg("PDF lang ang accepted. Wag kang maarte!");
      return;
    }
    try {
      const { extractTextFromPDF } = await import("@/lib/pdf");
      const extracted = await extractTextFromPDF(file);
      if (!extracted) {
        setErrorMsg("Hindi ma-read ang PDF na 'yan. Try mo i-paste manually.");
        return;
      }
      setText(extracted);
      setErrorMsg("");
    } catch {
      setErrorMsg("May error sa pag-read ng PDF. I-paste mo na lang.");
    }
  }

  async function handleRoast() {
    const trimmed = text.trim();
    if (trimmed.length < 50) {
      setErrorMsg("Ang ikli naman! Paste mo yung buong resume mo, hindi lang pangalan mo.");
      return;
    }
    setStatus("loading");
    setCompleting(false);
    setErrorMsg("");
    setRoast(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Unknown error");
      }

      setRoast(data);
      setCompleting(true);

      // Let the progress bar complete before showing results
      setTimeout(() => {
        setStatus("done");
        setCompleting(false);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 600);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "May error. Subukan ulit!");
      setStatus("error");
    }
  }

  function handleReset() {
    setText("");
    setRoast(null);
    setStatus("idle");
    setCompleting(false);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isLoading = status === "loading" || status === "error";

  return (
    <main className="main">
      {isLoading && (
        <LoadingScreen
          completing={completing}
          hasError={status === "error"}
          errorMsg={errorMsg}
          onRetry={handleReset}
        />
      )}
      {/* Hero */}
      <header className="hero">
        <div className="hero-badge">🇵🇭 For Filipinos, by Filipinos</div>
        <h1 className="hero-title">
          Resume Roaster <span className="hero-ph">PH</span>
        </h1>
        <p className="hero-subtitle">
          I-paste ang resume mo. Tatanggapin namin ng buong puso.
          <br />
          <strong>At i-roast namin nang walang awa.</strong>
        </p>
      </header>

      {/* Input Section */}
      <section className="input-section">
        <div className="input-card">
          <div className="input-header">
            <span className="input-step">01</span>
            <h2 className="input-title">I-paste o i-upload ang resume mo</h2>
          </div>

          <textarea
            className="resume-textarea"
            placeholder="I-paste mo dito ang resume mo... (plain text, o mag-upload ng PDF sa baba)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
          />

          <div className="input-actions">
            <label className="pdf-upload-label">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="pdf-input-hidden"
              />
              📄 Mag-upload ng PDF
            </label>

            {text && (
              <span className="char-count">
                {text.length.toLocaleString()} chars
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="error-msg" role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            className="roast-btn"
            onClick={handleRoast}
            disabled={isLoading}
          >
            🔥 I-roast mo ako!
          </button>
        </div>
      </section>

      {/* Result Section */}
      {status === "done" && roast && (
        <section className="result-section" ref={resultRef}>
          <div className="result-header">
            <h2 className="result-title">Narito na ang katotohanan 👇</h2>
            <button className="reset-btn" onClick={handleReset}>
              Subukan ulit
            </button>
          </div>
          <RoastCard roast={roast} />
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>
          Walang resume ang naiwan nang buo. 🔥
        </p>
        <p className="footer-disclaimer">
          Para sa entertainment lang. Pero seryoso ka na mag-update ng resume mo.
        </p>
      </footer>
    </main>
  );
}
