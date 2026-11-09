# Chrome Web Store Release Checklist

Current target: PageSurgeon `0.1.0` initial release.

Official sources:

- Prepare: https://developer.chrome.com/docs/webstore/prepare
- Publish: https://developer.chrome.com/docs/webstore/publish
- Listing: https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- Images: https://developer.chrome.com/docs/webstore/images
- Privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Program policies: https://developer.chrome.com/docs/webstore/program-policies
- User data FAQ: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- Limited Use: https://developer.chrome.com/docs/webstore/program-policies/limited-use
- Review process: https://developer.chrome.com/docs/webstore/review-process
- Security: https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure
- Trader disclosure: https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure

## Code and package

- [x] Manifest V3.
- [x] Version is `0.1.0` in `manifest.json`.
- [x] Description is under 132 characters.
- [x] No remote code, `eval`, `new Function`, CDN scripts, or remote styles.
- [x] No network requests or external services.
- [x] No `externally_connectable`, `web_accessible_resources`, or remote iframes.
- [x] Explicit extension-page CSP.
- [x] Background message handler validates `sender.id` and requires `sender.tab`.
- [x] Download messages accept only PNG data URLs and sanitized `.png` filenames.
- [x] Removed unused `activeTab` and `scripting` permissions.
- [x] Removed unused `chrome.action.onClicked` listener and page `postMessage` toggle path.
- [x] Run a clean-profile install and full mode test after the latest changes.
- [x] Confirm `chrome://extensions/` shows no manifest or service-worker errors.
- [x] Confirm screenshots work with only `storage`, `downloads`, and `<all_urls>`.
- [x] Remove or exclude `ext-full-screenshot/`, `ext-go-full/`, `.git/`, docs, and assets from the release ZIP.
- [x] Build ZIP with `manifest.json` at the root, not inside a folder.
- [x] Inspect the ZIP contents before upload.
- [x] Confirm no secrets, keys, or local paths are included.

Suggested package command:

```bash
mkdir -p dist
rm -f dist/pagesurgeon-0.1.0.zip
zip -r dist/pagesurgeon-0.1.0.zip \
  manifest.json popup.html icons scripts styles \
  -x 'icons/icon.svg' '*.DS_Store' '*/.*'
```

## Store listing

- [x] 128x128 PNG extension icon in the ZIP. Artwork is 96x96 with 16px transparent padding.
- [x] Two 1280x800 screenshots in `assets/store/`.
- [x] Screenshots show the real side panel and two modes.
- [x] 440x280 promotional tile in `assets/store/`.
- [ ] Optional 1400x560 marquee image.
- [x] Detailed description explains the single purpose and does not overpromise.
- [ ] Category selected. `Developer Tools` is the closest fit for DOM editing.
- [ ] Homepage URL set, for example the GitHub repository.
- [ ] Support URL set, for example `https://github.com/devroy10/page-surgeon/issues`.
- [ ] Privacy policy URL set to a public HTTPS page containing `PRIVACY.md`.
- [ ] Test instructions explain how to try all four modes without an account.
- [ ] Listing does not include "coming soon" or placeholder copy.

## Store listing copy

Short description (already in `manifest.json`):

> Surgically edit, delete, blur, and screenshot any element on a webpage

Detailed description:

> PageSurgeon is a focused page-editing tool for the page you are viewing. It lets you make a clean copy, remove distractions, or capture a specific element without opening a design app.
>
> - Delete: remove an element and undo the change before reloading.
> - Edit text: change text inline and save with Enter or a click.
> - Screenshot: capture a visible element or a tall element that needs scrolling.
> - Blur: hide sensitive content and save the blur for future visits to the same site.
>
> PageSurgeon does not publish changes to the website. Delete and edit changes are temporary; blur rules are stored locally in your browser.
>
> No account, analytics, advertising, or telemetry. Screenshots are saved only when you click Capture, and blur rules stay in `chrome.storage.local`. Full details: the linked privacy policy.

Category: `Developer Tools`.

## Reviewer test instructions

Ready to paste into the dashboard:

> No account or credentials are required.
>
> 1. Open https://example.com.
> 2. Click the PageSurgeon toolbar icon, choose Delete, and click Activate.
> 3. Hover over the heading, click it, then click Delete element in the side panel. Use Undo to restore it.
> 4. Choose Edit text in the popup, activate it, click the paragraph, change the text, and click Save & exit.
> 5. Choose Screenshot, activate it, click the heading, and click Capture screenshot. A PNG downloads.
> 6. Choose Blur, activate it, click an element, and click Apply & save blurs. Reload the page to confirm the blur persists.
>
> Press Escape or the panel close button to exit any mode.

## Privacy tab

Suggested single-purpose description:

> Edit the webpage currently being viewed by deleting, editing, screenshotting, or blurring individual elements chosen by the user.

Suggested permission justifications:

- `storage`: Stores the user's blur rules locally so they can be re-applied on later visits.
- `downloads`: Saves the screenshot the user explicitly requests to the Downloads folder.
- `<all_urls>`: Injects the page overlay on the site the user chooses and checks for saved blur rules on any site.

Remote code:

- [ ] Select "No, I am not using remote code."

Data use:

- [ ] Disclose website content (DOM/text, screenshots, CSS selectors).
- [ ] Disclose web browsing activity if the dashboard treats the stored page hostname as browsing activity.
- [ ] Certify no sale of data.
- [ ] Certify no use for unrelated purposes, advertising, profiling, or creditworthiness.
- [ ] Certify compliance with Limited Use.
- [ ] Ensure the privacy policy URL matches these answers exactly.

## Account and distribution

- [ ] Developer account email verified.
- [ ] Two-factor authentication enabled.
- [ ] Trader or non-trader status declared. All developers must declare it.
- [ ] If trader: legal name, address, and SMS-verified phone number are ready to be shown publicly.
- [ ] Visibility chosen: public, unlisted, or private trusted testers.
- [ ] Regions selected.
- [ ] If publishing a parallel beta, the name ends with "BETA" or "DEVELOPMENT BUILD" and the description says "THIS EXTENSION IS FOR BETA TESTING".
- [ ] Review timeline accepted: new developers, new extensions, broad host access, and large code changes can take longer.

## Review and release

- [ ] Submit for review.
- [ ] Monitor the publisher email for rejection or warning messages.
- [ ] If rejected, fix the cited policy issue and resubmit; do not create a duplicate listing.
- [ ] After approval, install from the store URL and repeat the smoke test.
- [ ] Tag the released commit and keep a local copy of the exact uploaded ZIP.

## Current gaps

- The privacy policy is written but still needs a public HTTPS URL in the dashboard.
- Trader/non-trader classification needs a developer decision.
