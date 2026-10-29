# ReproRelay — Professional Chrome Bug Reporter

A local-first, Manifest V3 Chrome extension that selects a DOM element, captures its page context, optionally takes a visible-tab screenshot, and exports a structured bug ticket as Markdown.

## Requirements

- Google Chrome
- Node.js (Node 20+ recommended; tested with Node 22)
- npm, git, Python 3 (for the demo server)

## Run on macOS

```bash
cd reprorelay
npm install
npm run build
```

Then open `chrome://extensions` in Chrome, turn on **Developer mode**, choose **Load unpacked**, and select the **absolute `reprorelay/dist` folder**. (Choose `dist`, not the source directory.)

For changes: `npm run build` and click **Reload** on the extension card.

## Demo from scratch

Open a second terminal:

```bash
cd reprorelay
python3 -m http.server 8000 --directory demo
```

Open `http://localhost:8000` in Chrome. The “Create account” button is intentionally broken.

1. Open the ReproRelay popup from the extensions toolbar.
2. Click **Select element**; the popup may close as you return to the webpage.
3. Hover over and click **Create account**. The click is intentionally intercepted to pick the element.
4. Reopen the popup and confirm the selector and URL appear.
5. Enter title, expected behavior, actual behavior and steps.
6. Click **Screenshot** (optional), then **Export Markdown bug report**.
7. If you captured a screenshot, download it separately and attach it to the report.

## File structure

```text
reprorelay/
├── demo/index.html               # self-contained buggy site
├── public/manifest.json          # Manifest V3 permissions and popup
├── src/
│   ├── extension/
│   │   ├── browser.ts            # chrome.scripting + screenshot
│   │   ├── picker.ts             # user-driven element selector overlay
│   │   └── report.ts             # Markdown and file downloads
│   ├── App.tsx                   # UI and local storage state
│   ├── index.css                 # popup design
│   ├── main.tsx
│   └── types.ts
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## What we deliberately do NOT collect

No keystrokes, form values, DOM innerText, cookies, network traffic, or credentials. We store the current draft, selected element tag/selector, URL without query/hash, and optional screenshot in `chrome.storage.local`. These artifacts can still contain sensitive data (for example, a URL path, an element ID, or a screenshot), so review before sharing. No network uploads are performed by this extension.

## Browser permissions

- `activeTab`: user-triggered access to the current page
- `scripting`: inject the element picker only when the user asks
- `storage`: store the report locally

No global host permissions, content script patterns, or background service worker are required for this MVP.

## Known limitations

- Cannot inject on `chrome://`, the Chrome Web Store, or some other restricted pages.
- Picks elements in the top document only (not inside cross-origin iframes).
- The selector is a best-effort CSS path; dynamic classes can make it unstable.
- The screenshot captures the visible browser tab, not a full-page screenshot.
- One report at a time; screenshot export is a separate download.
- The extension has not been published to the Chrome Web Store.

## Two-person GitHub workflow

Person A initializes and pushes the base to a NEW GitHub repository:

```bash
git init
git add .
git commit -m "chore: bootstrap ReproRelay MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reprorelay.git
git push -u origin main
```

Partner clones the repository after being added as a collaborator:

```bash
git clone https://github.com/YOUR_USERNAME/reprorelay.git
cd reprorelay
npm install
```

Person A:

```bash
git switch -c feat/capture-engine
# Work on src/extension/browser.ts, picker.ts, report.ts
git add .
git commit -m "feat: improve browser capture workflow"
git push -u origin feat/capture-engine
```

Person B:

```bash
git switch -c feat/report-ui
# Work on src/App.tsx and src/index.css
git add .
git commit -m "feat: polish issue report editor"
git push -u origin feat/report-ui
```

Open one pull request per feature branch, merge to main, then both run `git switch main && git pull`.

## Suggested 24-hour scope

**Must ship:** element picker, DOM selector, URL, report form, Markdown export, one error demo.

**Nice to have:** screenshot export, copy report, local history, GitHub Issue link.

**Avoid:** authentication, AI chatbot, backend hosting, paid services, unsupervised page crawling.

## Demo pitch (25 seconds)

"Debugging a website is fast. Reporting the bug usually isn't. ReproRelay lets a developer select the broken element directly on the page, captures the technical context, and converts it into a clear report with reproduction steps and optional screenshot — all without an account or unrestricted site access."
