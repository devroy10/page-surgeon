<!-- <p align="center"><a href="https://ideogram.ai/" target="_blank" rel="noopener noreferrer"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/page-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="assets/page-light.png">
  <img src="assets/page-light.png" alt="Ideogram" width="500">
</picture></a></p> -->

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/page-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="assets/page-light.png">
  <img src="assets/page-light.png" alt="PageSurgeon" width="640">
</picture></p>
<p align="center">
  <strong>Surgical page editing for Chrome.</strong>
</p>
<p align="center">
  PageSurgeon lets you delete, edit, screenshot, and blur any element on any webpage. Point at it, click it, done.
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Chrome%20Web%20Store-coming%20soon-lightgrey?logo=googlechrome&logoColor=white" alt="Chrome Web Store: coming soon" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero dependencies" />
  <img src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black" alt="Vanilla JavaScript" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="#development"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
</p>
<p align="center">
  <a href="#how-it-works">How it works</a>
  ·
  <a href="#installation">Installation</a>
  ·
  <a href="#usage">Usage</a>
  ·
  <a href="#development">Development</a>
  ·
  <a href="#roadmap">Roadmap</a>
  ·
  <a href="docs/PRD.md">PRD</a>
</p>

---

# PageSurgeon

PageSurgeon is a Chrome extension for editing webpages in place. You pick a mode. You hover over the page. The element under your cursor is highlighted. You click to act on it.

Use it to remove a cookie banner before a screenshot. Use it to fix a typo in a mockup. Use it to capture one clean card from a long page. Use it to blur an email address or an account number before you share your screen.

PageSurgeon is built on Manifest V3 and native browser APIs only. It has zero dependencies and no build step.

## Contents

- [How it works](#how-it-works)
- [Modes](#modes)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Permissions](#permissions)
- [Scope](#scope)
- [Development](#development)
- [Roadmap](#roadmap)
- [License](#license)

## How it works

1. **Choose.** Click the PageSurgeon icon in the toolbar. The popup lists four modes: Delete, Edit Text, Screenshot, and Blur.
2. **Activate.** Click "Activate". The content script on the current tab enters the selected mode.
3. **Target.** Hover over the page. A shared hover and select layer highlights the element under your cursor. Every mode reuses this layer.
4. **Act.** Click the element. The mode class handles the rest: it removes the element, makes it editable, captures it, or blurs it.
5. **Finish.** Press `Escape` to leave the mode. Use the side panel for actions such as saving blurs.

Each mode is a small, pluggable class in `scripts/modes/`. The mode controller in `content.js` owns the lifecycle. The service worker in `background.js` handles the APIs that content scripts cannot call, such as screenshot capture and file downloads.

## Modes

| Mode | What it does | Persistence |
|---|---|---|
| 🗑️ **Delete** | Removes the clicked element from the DOM. Keeps an undo stack. | Session only. A reload restores the page. |
| ✏️ **Edit Text** | Makes the clicked text element editable inline. `Enter` saves, `Escape` cancels, and clicking away saves. | Session only. A reload restores the page. |
| 📷 **Screenshot** | Captures a clean PNG of the selected element. Elements taller than the viewport are scrolled and stitched. | Saved as a file through `chrome.downloads`. |
| 🔵 **Blur** | Blurs sensitive elements. Select several, preview the blur, then save them all with one click. | Saved rules survive reloads. |

## Features

- **Delete with undo**: remove any element and step back with `Ctrl+Z`.
- **Inline text editing**: uses `contenteditable`, with `Enter`, `Escape`, and click-away handling.
- **Viewport screenshots**: capture the visible part of an element through `chrome.tabs.captureVisibleTab`.
- **Scroll-and-stitch screenshots**: capture elements larger than the viewport by scrolling and stitching tiles.
- **Overlay suppression**: fixed and sticky elements are handled per tile, so headers and chat widgets do not repeat in stitched images.
- **Persistent blur**: rules are stored in `chrome.storage.local`. A `MutationObserver` re-applies them when the page changes.
- **Batch blur**: click several elements to preview the blur, then save them together.
- **No dependencies**: native browser APIs only.

## Installation

### From the Chrome Web Store

Coming soon.

### For development

```bash
git clone <repository-url>
cd pagesurgeon
```

Then load the extension in Chrome:

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `pagesurgeon` folder.
4. Pin the PageSurgeon icon to the toolbar.

## Usage

1. Click the PageSurgeon icon in the toolbar to open the popup.
2. Select a mode: Delete, Edit Text, Screenshot, or Blur.
3. Click **Activate** to enter the mode.
4. Hover over elements to highlight them. Click to act.
5. Use the side panel for actions.
6. Press `Escape` to exit.

## Keyboard shortcuts

| Key | Mode | Action |
|---|---|---|
| `Escape` | All | Cancel or exit the current action |
| `Delete` | Delete | Remove the selected element |
| `Ctrl+Z` | Delete | Undo the last deletion |
| `Enter` | Edit Text | Save the edited text |

## Permissions

PageSurgeon asks for the smallest set of Chrome permissions that its modes need.

| Permission | Used by | Purpose |
|---|---|---|
| `activeTab` | All modes | Run on the tab you are working in |
| `scripting` | All modes | Inject the mode scripts into the page |
| `storage` | Blur | Save blur rules in `chrome.storage.local` |
| `downloads` | Screenshot | Save captured PNG files |

## Scope

- Delete and Edit Text change your local view of the page only. They do not change the website, and they do not persist across reloads.
- Blur is the only mode that persists. Saved rules are stored in your browser and are re-applied on later visits.
- Chrome does not allow extensions to run on some pages, such as `chrome://` pages and the Chrome Web Store. PageSurgeon cannot activate there.
- Scroll-and-stitch capture depends on the page scrolling normally. Pages with custom scroll containers or heavy animation can produce imperfect stitches.
- PageSurgeon runs in your browser and needs no account, server, or API key.

## Development

There is no build step and no package manager. Edit the files, then reload the extension from `chrome://extensions/`.

```
pagesurgeon/
├── manifest.json
├── popup.html
├── icons/
├── styles/
│   ├── popup.css
│   └── panel.css
├── scripts/
│   ├── background.js       # Service worker
│   ├── content.js          # Mode controller
│   ├── popup.js            # Popup UI
│   ├── utils/
│   │   └── dom-utils.js    # Shared helpers
│   └── modes/
│       ├── delete-mode.js
│       ├── edit-mode.js
│       ├── screenshot-mode.js
│       └── blur-mode.js
└── docs/
    └── PRD.md
```

- `manifest.json`: Manifest V3 configuration and permissions
- `scripts/background.js`: service worker for screenshot capture and downloads
- `scripts/content.js`: mode controller and shared hover and select layer
- `scripts/popup.js`: popup UI and mode selection
- `scripts/modes/`: one class per mode, all built on the shared infrastructure
- `scripts/utils/dom-utils.js`: shared DOM helpers
- `docs/`: product requirements document

To add a mode, create a class in `scripts/modes/` and register it in `content.js`. Pull requests are welcome.

## Roadmap

### Completed

- [x] **Delete mode**: element deletion with an undo stack
- [x] **Edit Text mode**: inline `contenteditable` editing with `Enter`, `Escape`, and click-away
- [x] **Screenshot mode**: viewport and scroll-capture element screenshots
- [x] **Scroll-and-stitch full-element screenshots**: capture elements larger than the viewport
- [x] **Scroll-capture overlay suppression**: fixed and sticky elements handled per tile
- [x] **Blur mode**: persistent blur across reloads via `chrome.storage` and `MutationObserver`
- [x] **Batch blur**: select several elements and blur them together
- [x] **Multi-select blur workflow**: click to preview, batch save with one click

### Planned

- [ ] **Manage Blurs UI**: popup page listing saved blur rules with remove and toggle
- [ ] **Blur intensity slider**: adjustable strength (4px / 8px / 16px / 32px)
- [ ] **Undo blur**: per-rule removal and reversal
- [ ] **Blur rule toggle**: enable or disable individual rules without removing them
- [ ] **Blur rule sharing**: export and import rules as JSON
- [ ] **Element picker**: DevTools-style CSS selector input for direct targeting
- [ ] **Custom CSS injection**: hide, highlight, and outline elements
- [ ] **History panel**: full session log of deletes, edits, and blurs

## License

MIT