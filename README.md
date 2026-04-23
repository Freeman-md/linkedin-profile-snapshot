# LinkedIn Profile Snapshot

> Chrome extension that extracts visible LinkedIn profile data and copies the canonical profile URL or full snapshot JSON to your clipboard.

## Project Metadata
- Type: project
- Domain: Browser Extensions / Developer Tooling
- Status: v0.1.0 — functional, packaged for Chrome Web Store manual submission
- Level: intermediate
- Year: 2026
- Featured: false
- Repository URL: Not public
- Live URL: Not deployed
- Thumbnail URL:

## Summary

LinkedIn Profile Snapshot is a Manifest V3 Chrome extension built with WXT and TypeScript. When activated on a `linkedin.com/in/*` profile page, it reads visible DOM content via a content script, extracts structured profile fields (name, headline, location, about, experience, recent activity, and section data), and surfaces them in a popup UI. Users can copy the canonical profile URL or the full extracted snapshot as JSON with a single button press. All processing is local — no backend, no analytics, no data transmission.

## Tech Stack

- TypeScript 5.x
- WXT (Web Extension Framework) 0.20.x
- Vite 7 / Rollup 4 (via WXT)
- Vitest 3 with jsdom for unit testing
- ESLint 9 + @typescript-eslint for linting
- Prettier for formatting
- GitHub Actions for CI and release packaging

## Problem / Context

LinkedIn does not expose a public API for reading profile data. Manually copying profile information — for recruiting, outreach, or research workflows — is slow and error-prone. Copy-pasting name, headline, location, and experience one field at a time from a browser tab produces inconsistent output with no canonical URL attached.

This extension solves the friction of capturing a structured snapshot of a visible LinkedIn profile page in a single interaction, without requiring any server-side component or OAuth flow.

## System Snapshot

### Core System Idea

A content script injected into `linkedin.com/in/*` pages listens for a message from the popup. When triggered, it runs DOM extraction logic against the live page and returns a typed `ProfileSnapshot` object. The popup renders the result and exposes copy actions backed by the Clipboard API.

### Main Components

1. **Content script** (`entrypoints/linkedin-profile.content.ts`) — injected on matching LinkedIn profile URLs; handles the `chrome.runtime.onMessage` listener and delegates to `buildProfileSnapshot`
2. **Profile snapshot utility** (`utils/profile-snapshot.ts`) — pure DOM extraction logic; parses the visible page tree into a `ProfileSnapshot` struct using CSS selector heuristics and `innerText` traversal
3. **Popup entry** (`entrypoints/popup/main.ts`) — bootstraps the popup, queries the active tab, sends the snapshot request message, and wires copy actions to the view
4. **Popup view** (`entrypoints/popup/view.ts`) — imperative DOM view with four render states: `loading`, `unsupported`, `error`, and `ready`; manages toast feedback
5. **Clipboard utility** (`utils/clipboard.ts`) — thin wrapper over `navigator.clipboard.writeText`
6. **WXT config + manifest** (`wxt.config.ts`) — declares extension name, icons, `clipboardWrite` permission, and `host_permissions` scoped to `linkedin.com/in/*`

## Design Focus

- No runtime dependencies — all logic runs in the browser with no external fetch or backend calls
- Typed message passing between content script and popup using a discriminated union (`ProfileSnapshotResponse`)
- DOM extraction is heuristic-based: selector priority lists, noise filtering via `SECTION_NOISE` and `SECTION_TITLES` sets, and deduplication via seen-sets
- Popup renders a minimal glassmorphism UI with a defined CSS variable token set (`styles.ts`); all state transitions are explicit enum-like discriminated union branches
- Test coverage via jsdom with a custom `innerText` fallback shim to simulate real browser rendering behavior in a Node environment

## Core Innovation

The extraction layer (`buildProfileSnapshot`) handles LinkedIn's deeply nested, frequently changing DOM without relying on class names as primary selectors. It uses structural heuristics: `h1` for name, section heading detection via `h2`/`[aria-level='2']`, `aria-label="profile header"` for the top card, and `<article>` / `<li>` traversal for experience and activity blocks. Noise filtering removes CTA strings (Follow, Connect, See all) before they pollute the output. The canonical profile URL is normalised from either the `<link rel="canonical">` tag or the current page URL, stripping path suffixes, query strings, and fragments.

## Implementation

The extension is built as a WXT project targeting Chrome MV3. The content script is declared using `defineContentScript` with a `matches` pattern. The popup is a plain TypeScript module with no UI framework — the view is constructed imperatively using `document.createElement` and `DocumentFragment`. State transitions call `view.render(state)` directly.

Unit tests in `tests/profile-snapshot.test.ts` construct JSDOM documents that mirror realistic LinkedIn markup and assert on every field of the returned snapshot, including `profileUrl` normalisation, `recentActivity`, `experiences`, `sections`, and top-card field inference under noisy DOM conditions. A `vitest.config.ts` configures the `jsdom` environment and v8 coverage.

CI runs lint, typecheck, test, and build on every push. The release workflow packages the extension to `.output/linkedin-profile-snapshot-extension-0.1.0-chrome.zip` on version tags or manual dispatch.

## Performance / Operational Profile

### Latency Profile
- Title: Synchronous popup initialisation
- Description: Snapshot extraction runs synchronously on the content script side and returns via `chrome.tabs.sendMessage`. There are no async DOM reads or network calls. Round-trip from popup open to rendered snapshot is bounded by message passing overhead, not extraction complexity.

### System Focus
- Title: Local-only execution
- Description: The extension has no background service worker and performs no network I/O. The `clipboardWrite` permission is the only browser capability used beyond tab messaging. Host permission is scoped strictly to `https://www.linkedin.com/in/*`.

## Outcomes

- End-to-end extraction pipeline working: name, headline, location, about, experience blocks, recent activity blocks, and generic sections are all parsed and returned as a typed snapshot
- Popup renders all four state branches and surfaces copy feedback via an auto-clearing toast
- Unit test suite covers canonical URL normalisation, full section extraction, and noise filtering under multiple DOM configurations
- CI pipeline validates lint, types, tests, and build on every branch push; packaging is automated on tag push

## Why This Matters

Manual LinkedIn data capture is a recurring time sink in recruiting, sales, and research workflows. This extension removes that friction without requiring third-party integrations, OAuth credentials, or a hosted backend. The extraction logic is self-contained and testable, making it straightforward to adapt as LinkedIn's DOM structure evolves. The privacy-first design — no external data transmission, scoped host permissions — makes it deployable in environments where data handling policies are strict.

## Future Improvements

- Support for sub-pages (`/details/experience/`, `/details/skills/`) where section content differs from the main profile view
- Export formats beyond JSON (plain text, Markdown, CSV)
- Detection of LinkedIn DOM changes via test fixtures updated against real pages
- Optional field configuration in the popup (choose which sections to include in the copied snapshot)
- Firefox support via the existing WXT multi-browser build infrastructure
