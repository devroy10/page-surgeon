# PageSurgeon Privacy Policy

Last updated: October 21, 2026

PageSurgeon is a Chrome extension for deleting, editing, screenshotting, and blurring elements on webpages. This policy explains what data the extension handles and how it is handled.

## Summary

- PageSurgeon processes webpage content locally in your browser.
- PageSurgeon does not transmit page content, screenshots, blur rules, browsing activity, or usage data to the developer or any third party.
- PageSurgeon has no account system, analytics, advertising, telemetry, or remote code.
- Screenshots are saved to your Downloads folder.
- Blur rules are saved in Chrome's local extension storage.

## What PageSurgeon handles

PageSurgeon runs a content script on webpages so it can provide its single purpose: editing the page you are viewing. It handles data only as needed for that purpose:

- **Webpage content**: When you activate a mode, PageSurgeon reads the webpage element under your cursor and may modify it (delete it, edit its text, blur it, or capture it). It does not upload this content.
- **Screenshots**: In Screenshot mode, PageSurgeon captures the visible tab and crops or stitches the selected element into a PNG. The image may contain whatever is visible on the page, including personal or sensitive information. The image is saved directly to your Downloads folder.
- **Blur rules**: In Blur mode, PageSurgeon saves the current page hostname, a CSS selector for the selected element, and the blur strength in `chrome.storage.local`. These rules let the blur re-apply when you visit the same site again.
- **Page address**: PageSurgeon reads the current page's hostname to match saved blur rules. It does not keep a history of the pages you visit; the only hostname it stores is one you explicitly save with a blur rule.

PageSurgeon does not request or collect your name, email address, account credentials, payment information, health information, location, or personal communications.

## How data is used

PageSurgeon uses the data above only to provide its page-editing features:

- to highlight and act on the element you select;
- to create the screenshot you request;
- to save and re-apply blurs you create.

PageSurgeon does not use data for advertising, profiling, creditworthiness, or any unrelated purpose.

## Data sharing and transfers

PageSurgeon does not sell, rent, or transfer user data to third parties. It does not use advertising platforms, data brokers, or information resellers. All processing happens in your browser.

If you choose to share a screenshot or a webpage showing a PageSurgeon edit, you are sharing that content yourself. PageSurgeon is not involved in that transfer.

## Storage and retention

- **Screenshots** are saved to your Downloads folder and remain there until you delete them.
- **Blur rules** remain in `chrome.storage.local` until you remove them, clear the extension's storage, or uninstall PageSurgeon.
- **Page edits** (delete and edit text) are temporary changes to the current page and are not saved by PageSurgeon. Reloading the page restores the original content.

You can delete stored blur rules by clearing PageSurgeon's extension data in Chrome or by uninstalling the extension.

## Permissions

PageSurgeon requests these permissions:

- **Host access to all sites (`<all_urls>`)**: required to run the page overlay on any site the user chooses and to re-apply saved blur rules after a reload.
- **Storage**: required to save blur rules locally.
- **Downloads**: required to save screenshots to your Downloads folder.

PageSurgeon does not request the `tabs`, `scripting`, or `activeTab` permissions.

## Security

PageSurgeon handles all data locally and does not transmit user data over a network. Messages from content scripts are validated by the background service worker before privileged actions such as capturing a tab or starting a download are performed.

## Limited Use disclosure

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Contact

Questions or requests about this policy can be filed at:

https://github.com/devroy10/page-surgeon/issues

## Changes to this policy

If this policy changes, the updated version will be posted at this URL and the "Last updated" date will be revised.
