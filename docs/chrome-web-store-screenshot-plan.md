# Chrome Web Store Screenshot Plan

Chrome Web Store screenshots should show the actual user experience. The official guidance allows 1 to 5 screenshots, and `1280x800` is preferred over `640x400`.

## Recommended screenshot set

1. Real LinkedIn profile page with the popup open and visible top-card details loaded.
   Focus:
   show the extension reading a normal profile with the profile name, headline, location, and the `Copy Full Details` primary action.

2. Popup showing the About section and the full-details action.
   Focus:
   show that the extension captures visible About text when present.

3. Popup showing recent activity entries.
   Focus:
   show that visible activity snippets are included when LinkedIn exposes them on screen.

4. Popup showing experience details.
   Focus:
   show that visible experience entries and detail lines are included.

5. Unsupported-state screenshot on a non-profile LinkedIn page.
   Focus:
   show the clear guardrail message when the active tab is not a supported `linkedin.com/in/*` page.

## Capture instructions

- Use Chrome with the unpacked extension loaded from `.output/chrome-mv3`.
- Use real LinkedIn pages and the real popup UI.
- Capture the popup together with enough of the underlying page to make the context obvious.
- Keep the screenshots full bleed with square corners and no padding.
- Avoid blurring or pixelation.
- If text becomes unreadable when scaled down, simplify the composition rather than adding callout text.

## Promo tile brief

The Chrome Web Store also requires a small promotional image at `440x280`.

Recommended concept:

- Use the existing blue-and-white brand palette from the extension icon.
- Feature the extension name and one short value statement:
  `Copy LinkedIn profile details instantly`
- Include a simple card motif that echoes the popup layout without pretending to be a screenshot.

Prepared asset:

- `assets/store/promo-small-440x280.png`
