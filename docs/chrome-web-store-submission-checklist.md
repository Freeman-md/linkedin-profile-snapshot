# Chrome Web Store Submission Checklist

## Before upload

- Confirm your Google account has 2-step verification enabled.
- Confirm your Chrome Web Store developer account is registered and active.
- Run `npm run check`.
- Run `npm run zip`.
- Use the latest package: `.output/linkedin-profile-snapshot-extension-0.1.0-chrome.zip`.

## Store listing tab

- Title: `LinkedIn Profile Snapshot`
- Summary: use the summary from `docs/chrome-web-store-listing.md` and keep it under 132 characters.
- Description: use the long description from `docs/chrome-web-store-listing.md`.
- Category: `Productivity`
- Language: `English`
- Upload at least 1 screenshot, preferably 5.
- Upload the required small promo tile at `440x280`.
  Ready-made asset: `assets/store/promo-small-440x280.png`
- Add support URL and website URL pointing to the GitHub repo.

## Privacy tab

- Single purpose:
  `Copy visible LinkedIn profile details and the canonical profile URL from LinkedIn profile pages.`
- Permissions justification:
  `https://www.linkedin.com/in/*` is required so the extension can read the active LinkedIn profile page and extract the visible profile information shown to the user.
- Remote code:
  `No, this extension does not use remote code.`
- Data usage:
  `The extension does not transmit profile data to a server. Data is read locally from the active tab and copied to the user's clipboard only when the user presses a copy button.`
- Privacy policy URL:
  `https://github.com/Freeman-md/linkedin-profile-snapshot/blob/main/PRIVACY.md`

## Distribution tab

- Visibility: public
- Regions: all intended regions
- Payment: not a paid item

## Test instructions tab

This is optional, but you can paste:

`Install the extension, open any LinkedIn profile page under https://www.linkedin.com/in/*, click the toolbar icon, and verify that the popup shows visible profile details. Use "Copy Full Details" to copy the JSON snapshot and "Copy LinkedIn URL" to copy the canonical profile URL.`

## Screenshots and promo assets

- Follow the shot list in `docs/chrome-web-store-screenshot-plan.md`.
- Screenshots must show the real extension experience.
- Screenshots should be `1280x800` when possible, or `640x400` if needed.
- Small promo tile must be `440x280`.

## Final review

- Verify the extension icon looks correct in the store and toolbar.
- Re-check the privacy policy wording against the current build behavior.
- Make sure the listing does not claim hidden-data scraping, automation, or integrations that are not implemented.
- Consider deferring publish after review so you can choose the public launch timing manually.
