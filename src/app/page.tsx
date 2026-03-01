"use client";

import { useState, useRef, useEffect } from "react";
import type { RoastResult } from "@/types/roast";
import RoastCard from "@/components/RoastCard";
import LoadingScreen from "@/components/LoadingScreen";

type Status = "idle" | "loading" | "done" | "error";

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [completing, setCompleting] = useState(false);
  const [roast, setRoast] = useState<RoastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const dragEnterCount = useRef<number>(0);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function processPDFFile(file: File) {
    if (file.type !== "application/pdf") {
      setErrorMsg("PDFs only. Drop a .pdf file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setErrorMsg("That PDF is too large. Keep it under 5MB.");
      return;
    }

    setIsExtracting(true);
    setErrorMsg("");

    try {
      const { extractTextFromPDF } = await import("@/lib/pdf");
      const extracted = await extractTextFromPDF(file);
      if (!extracted.trim()) {
        setErrorMsg("Couldn't read that PDF. Try pasting manually.");
        setIsExtracting(false);
        return;
      }
      setText(extracted);
      setIsExtracting(false);
    } catch {
      setIsExtracting(false);
      setErrorMsg("Error reading the PDF. Just paste it.");
    }
  }

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-selected
    await processPDFFile(file);
  }

  async function handleRoast() {
    const trimmed = text.trim();
    if (trimmed.length < 50) {
      setErrorMsg("That's way too short! Paste your whole resume, not just your name.");
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

      completionTimerRef.current = setTimeout(() => {
        setStatus("done");
        setCompleting(false);
        scrollTimerRef.current = setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 600);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again!");
      setStatus("error");
    }
  }

  function handleReset() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    setText("");
    setRoast(null);
    setStatus("idle");
    setCompleting(false);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragEnterCount.current += 1;
    if (dragEnterCount.current === 1) setIsDragging(true);
  }

  function handleDragLeave() {
    dragEnterCount.current = Math.max(0, dragEnterCount.current - 1);
    if (dragEnterCount.current === 0) setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragEnterCount.current = 0;
    setIsDragging(false);

    if (status === "loading" || isExtracting) return;

    const { dataTransfer } = e;
    if (!dataTransfer) return;
    const file = dataTransfer.files[0];
    if (!file) return;

    await processPDFFile(file);
  }

  const isLoading = status === "loading" || status === "error";

  return (
    <>
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
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
          Paste your resume. We'll accept it with open arms.
          <br />
          <strong>And roast it with zero mercy.</strong>
        </p>
      </header>

      {/* Input Section */}
      <section className="input-section">
        <div
          className={`input-card${isDragging ? " drop-zone--active" : ""}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="input-header">
            <span className="input-step">01</span>
            <h2 className="input-title">Paste or upload your resume</h2>
          </div>

          <div className="textarea-wrapper">
            <textarea
              className="resume-textarea"
              placeholder="Paste your resume here... (plain text, or upload a PDF below)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
            />
            {isExtracting && (
              <div className="pdf-extract-overlay">
                <div className="pdf-extract-spinner" />
                <span className="pdf-extract-label">Reading your PDF...</span>
              </div>
            )}
          </div>

          <div className="input-actions">
            <label className={`pdf-upload-label${isExtracting ? " extracting" : ""}`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePDFUpload}
                className="pdf-input-hidden"
              />
              {isExtracting ? "Reading PDF..." : "Upload PDF"}
            </label>

            {isDragging && !isExtracting && (
              <span className="drop-hint">Drop it here!</span>
            )}

            {text && !isDragging && (
              <span className="char-count">
                {text.length.toLocaleString()} chars
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="error-msg" role="alert">
              {errorMsg}
            </div>
          )}

          <button
            className="roast-btn"
            onClick={() => handleRoast()}
            disabled={isLoading || isExtracting}
          >
            Roast me
          </button>
        </div>
      </section>

      {/* Result Section */}
      {status === "done" && roast && (
        <section className="result-section" ref={resultRef}>
          <div className="result-header">
            <h2 className="result-title">Here's the truth</h2>
            <button className="reset-btn" onClick={handleReset}>
              Try again
            </button>
          </div>
          <RoastCard roast={roast} />
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <p className="footer-tagline">No resume left unroasted.</p>
        <p className="footer-disclaimer">For entertainment only. But seriously, update that resume.</p>
        <div className="footer-meta">
          <span>
            Made by{" "}
            <a href="https://www.linkedin.com/in/wilsondetorres/" target="_blank" rel="noopener noreferrer" className="footer-link">
              Wilson De Torres
            </a>
          </span>
          <span className="footer-dot">·</span>
          <a href="https://github.com/wilsonDT/resume-roaster-ph" target="_blank" rel="noopener noreferrer" className="footer-link">
            Open source
          </a>
          <span className="footer-dot">·</span>
          <span>AI-powered, zero data stored</span>
        </div>
      </footer>
    </main>
    </>
  );
}
