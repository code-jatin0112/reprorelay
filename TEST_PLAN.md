# ReproRelay — Hackathon Acceptance Checklist

## Happy path
- [ ] `npm install` succeeds on a teammate's Mac
- [ ] `npm run build` creates `dist/manifest.json` and `dist/index.html`
- [ ] Chrome loads the unpacked `dist` extension
- [ ] Open `http://localhost:8000` from `python3 -m http.server 8000 --directory demo`
- [ ] Click extension → **Select element** → click broken "Create account" button
- [ ] Reopen popup: selector includes `#submit-btn` and URL is localhost
- [ ] Write issue title, steps, expected, actual, and severity; close/reopen; fields persist
- [ ] Capture screenshot; preview appears; separate JPEG downloads
- [ ] Export `.md`: title, priority, URL, selector, expected/actual, and steps exist
- [ ] Clear report: selection and screenshot disappear

## Security and errors
- [ ] Open `chrome://extensions`, attempt picker: clear error, no crash
- [ ] Test `Escape` while picker active: cancels selection; overlay disappears
- [ ] URL query parameters do not appear in stored report
- [ ] DOM form values, passwords, cookies, and page innerText are never collected
- [ ] No server requests are made by the extension; no broad site permission prompts
- [ ] Review screenshot and selectors before sharing (may still contain sensitive data)

## Pitch in 2 minutes
1. 15 seconds: why manual bug reports waste developer time
2. 25 seconds: demo an intentionally broken form
3. 30 seconds: select the element and show saved CSS selector + URL
4. 25 seconds: capture screenshot and export structured Markdown issue
5. 25 seconds: permissions, privacy, failure handling, business impact

## Final submission
- [ ] GitHub README is accurate and repository accessible to judges
- [ ] Both people have committed code through separate feature branches
- [ ] Demo video works with no account required
- [ ] Live screen share: extension and local demo page work
