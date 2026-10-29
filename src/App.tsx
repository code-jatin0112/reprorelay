import { useEffect, useState } from "react";
import { captureCurrentTab, startElementPicker } from "./extension/browser";
import { downloadFile, downloadScreenshot, markdownReport } from "./extension/report";
import {
  DRAFT_KEY, SCREENSHOT_KEY, SELECTION_KEY, emptyDraft,
  type BugDraft, type ElementSelection, type Priority,
} from "./types";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function App() {
  const [draft, setDraft] = useState<BugDraft>(emptyDraft);
  const [selection, setSelection] = useState<ElementSelection | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Click a button below to begin.");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    void chrome.storage.local.get([DRAFT_KEY, SELECTION_KEY, SCREENSHOT_KEY])
      .then((data) => {
        if (!mounted) return;
        if (data[DRAFT_KEY]) setDraft({ ...emptyDraft, ...(data[DRAFT_KEY] as BugDraft) });
        if (data[SELECTION_KEY]) setSelection(data[SELECTION_KEY] as ElementSelection);
        if (typeof data[SCREENSHOT_KEY] === "string") setScreenshot(data[SCREENSHOT_KEY]);
      })
      .catch((error: unknown) => {
        if (mounted) { setMessage(errorMessage(error)); setIsError(true); }
      })
      .finally(() => { if (mounted) setLoaded(true); });

    const onChanged = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === "local" && changes[SELECTION_KEY]) {
        setSelection((changes[SELECTION_KEY].newValue as ElementSelection | undefined) || null);
        setMessage("Element captured! Complete the report below.");
        setIsError(false);
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      void chrome.storage.local.set({ [DRAFT_KEY]: draft }).catch(() => {
        setMessage("Draft was not saved. Check browser storage.");
        setIsError(true);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [draft, loaded]);

  function update<K extends keyof BugDraft>(field: K, value: BugDraft[K]) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  async function pickElement() {
    setBusy(true);
    setIsError(false);
    try {
      await chrome.storage.local.set({ [DRAFT_KEY]: draft });
      await startElementPicker();
      setMessage("Click an element on the website, then reopen ReproRelay. Press Esc to cancel.");
    } catch (error) {
      setMessage(errorMessage(error));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function takeScreenshot() {
    setBusy(true);
    setIsError(false);
    try {
      const image = await captureCurrentTab();
      await chrome.storage.local.set({ [SCREENSHOT_KEY]: image });
      setScreenshot(image);
      setMessage("Screenshot saved locally. Review it before exporting.");
    } catch (error) {
      setMessage(errorMessage(error));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  function exportMarkdown() {
    try {
      const content = markdownReport(draft, selection, Boolean(screenshot));
      downloadFile(content, "reprorelay-bug-report.md", "text/markdown;charset=utf-8");
      setIsError(false);
      setMessage("Markdown exported. Download the screenshot separately if needed.");
    } catch (error) {
      setMessage(errorMessage(error));
      setIsError(true);
    }
  }

  async function reset() {
    if (!window.confirm("Clear the current report, selection, and screenshot?")) return;
    setDraft({ ...emptyDraft });
    setSelection(null);
    setScreenshot(null);
    try {
      await chrome.storage.local.remove([SELECTION_KEY, SCREENSHOT_KEY]);
      setIsError(false);
      setMessage("New report ready.");
    } catch (error) {
      setMessage(errorMessage(error));
      setIsError(true);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand"><span className="brand-icon">R</span><div><strong>ReproRelay</strong><small>BUG CAPTURE STUDIO</small></div></div>
        <span className="version">MVP · v0.1</span>
      </header>

      <section className="hero">
        <span className="eyebrow">LESS REPORTING. MORE SHIPPING.</span>
        <h1>From bug to brief<br /><em>in seconds.</em></h1>
        <p>Capture the right context, describe what broke, and export a developer-ready issue.</p>
      </section>

      <div className={`message ${isError ? "error" : ""}`} role="status">{message}</div>

      <section className="panel">
        <div className="section-heading"><h2><span className="step">01</span> Capture</h2><span className="muted">On the current tab</span></div>
        <div className="button-row">
          <button className="primary" onClick={() => void pickElement()} disabled={!loaded || busy}>◎ Select element</button>
          <button className="secondary" onClick={() => void takeScreenshot()} disabled={!loaded || busy}>▧ Screenshot</button>
        </div>
        <p className="hint">After clicking “Select element”, click the target on the webpage, then reopen this popup.</p>
        {selection ? (
          <div className="capture-card">
            <div className="capture-header"><span className="dot" /><strong>Element captured</strong><span className="muted">{selection.tag}</span></div>
            <div className="code">{selection.selector}</div>
            <div className="tiny-url" title={selection.pageUrl}>{selection.pageUrl}</div>
          </div>
        ) : <div className="empty">No element selected yet.</div>}
        {screenshot && (
          <div className="screenshot-box">
            <img src={screenshot} alt="Captured tab screenshot. Review for personal information before sharing." />
            <button className="text-button" onClick={() => downloadScreenshot(screenshot)}>↓ Download screenshot (.jpg)</button>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading"><h2><span className="step">02</span> Describe</h2><span className="muted">Saved automatically</span></div>
        <label htmlFor="title">Issue title</label>
        <input id="title" value={draft.title} maxLength={150} placeholder="e.g. Submit button does nothing" onChange={(e) => update("title", e.target.value)} />
        <label htmlFor="priority">Priority</label>
        <select id="priority" value={draft.priority} onChange={(e) => update("priority", e.target.value as Priority)}>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
        <label htmlFor="steps">Steps to reproduce</label>
        <textarea id="steps" rows={3} value={draft.steps} onChange={(e) => update("steps", e.target.value)} />
        <label htmlFor="expected">Expected behavior</label>
        <textarea id="expected" rows={2} placeholder="What should happen?" value={draft.expected} onChange={(e) => update("expected", e.target.value)} />
        <label htmlFor="actual">Actual behavior</label>
        <textarea id="actual" rows={2} placeholder="What happened instead?" value={draft.actual} onChange={(e) => update("actual", e.target.value)} />
      </section>

      <section className="panel actions">
        <div className="section-heading"><h2><span className="step">03</span> Export</h2><span className="muted">Share only when ready</span></div>
        <button className="primary full" onClick={exportMarkdown} disabled={!loaded || busy}>↓ Export Markdown bug report</button>
        <button className="text-button reset" onClick={() => void reset()} disabled={!loaded || busy}>Start a new report</button>
      </section>
      <footer>LOCAL-FIRST • NO ACCOUNTS • NO AUTOMATIC UPLOADS<br />Review URLs, selectors, and screenshots before sharing.</footer>
    </main>
  );
}
