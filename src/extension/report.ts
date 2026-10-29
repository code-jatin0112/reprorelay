import type { BugDraft, ElementSelection } from "../types";

export function markdownReport(
  draft: BugDraft,
  selection: ElementSelection | null,
  hasScreenshot: boolean,
): string {
  const text = (value: string) => value.trim() || "Not provided";
  return [
    `# ${draft.title.trim() || "Untitled bug"}`,
    "",
    `**Priority:** ${draft.priority}`,
    `**Page:** ${selection?.pageUrl || "Not captured"}`,
    `**Element:** ${selection?.tag || "Not captured"}`,
    `**Captured:** ${selection?.selectedAt || "Not captured"}`,
    "",
    "## CSS selector",
    "```css",
    selection?.selector || "/* No element selected */",
    "```",
    "",
    "## Steps to reproduce",
    text(draft.steps),
    "",
    "## Expected result",
    text(draft.expected),
    "",
    "## Actual result",
    text(draft.actual),
    "",
    "## Screenshot",
    hasScreenshot ? "Screenshot downloaded separately; attach its JPEG file." : "Not captured.",
    "",
    "---",
    "Captured with ReproRelay. Review any sensitive details before sharing.",
    "",
  ].join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadScreenshot(dataUrl: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = "reprorelay-screenshot.jpg";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
