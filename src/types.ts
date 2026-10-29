export type Priority = "Low" | "Medium" | "High";

export interface BugDraft {
  title: string;
  priority: Priority;
  expected: string;
  actual: string;
  steps: string;
}

export interface ElementSelection {
  selector: string;
  tag: string;
  pageUrl: string;
  selectedAt: string;
}

export const DRAFT_KEY = "rrDraft";
export const SELECTION_KEY = "rrSelection";
export const SCREENSHOT_KEY = "rrScreenshot";

export const emptyDraft: BugDraft = {
  title: "",
  priority: "Medium",
  expected: "",
  actual: "",
  steps: "1. Open the page\n2. ",
};
