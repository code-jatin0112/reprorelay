import { injectedPicker } from "./picker";

async function activeHttpTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) {
    throw new Error("Open an ordinary http/https website first. Chrome settings and browser stores are restricted.");
  }
  return tab;
}

export async function startElementPicker(): Promise<void> {
  const tab = await activeHttpTab();
  await chrome.scripting.executeScript({ target: { tabId: tab.id! }, func: injectedPicker });
}

export async function captureCurrentTab(): Promise<string> {
  const tab = await activeHttpTab();
  const jpeg = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: "jpeg",
    quality: 65,
  });
  if (jpeg.length > 4_500_000) {
    throw new Error("Screenshot is too large to keep locally. Try a smaller browser viewport.");
  }
  return jpeg;
}
