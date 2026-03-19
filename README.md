# LinkedIn Profile Snapshot

A small Chrome extension that reads the visible contents of a LinkedIn profile page and lets you copy the canonical LinkedIn profile URL or the full extracted snapshot.

## What it does

- Reads the active tab only when you click the extension icon.
- Extracts visible on-screen profile details from `linkedin.com/in/*` pages.
- Copies the profile URL or the full snapshot JSON to your clipboard.
- Stays local to your browser. There is no backend and no analytics.
- Targets the current English-language LinkedIn interface in v1.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Packaging

Create the Chrome extension zip for manual submission to the Chrome Web Store:

```bash
npm run zip
```

The packaged archive is written to `.output/linkedin-profile-snapshot-extension-0.1.0-chrome.zip`.

## Install locally

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Load the unpacked extension from `.output/chrome-mv3`.

## Permissions

- `clipboardWrite` to copy the snapshot to your clipboard on demand.
- `https://www.linkedin.com/in/*` host access so the content script can read the current profile page.

## Privacy

See [PRIVACY.md](./PRIVACY.md).
