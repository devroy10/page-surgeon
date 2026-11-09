class PopupManager {
  constructor() {
    this.elements = {
      statusValue: document.getElementById("statusValue"),
      activateButton: document.getElementById("activateButton"),
      helpButton: document.getElementById("helpButton"),
      helpSteps: document.getElementById("helpSteps"),
      modeInputs: document.querySelectorAll('input[name="mode"]'),
    };

    this.isActive = false;
    this.currentMode = "delete";
    this.contentScriptAvailable = true;
    this.init();
  }

  async sendMessage(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch {
      return null;
    }
  }

  init() {
    const version = document.querySelector(".popup__version");
    if (version) {
      version.textContent = `v${chrome.runtime.getManifest().version}`;
    }
    this.bindEvents();
    this.checkExtensionStatus();
  }

  showNoConnection() {
    this.contentScriptAvailable = false;
    document.getElementById("refreshNotice").hidden = false;
    document.getElementById("refreshLink").addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab) chrome.tabs.reload(tab.id);
      });
    });
    this.elements.activateButton.disabled = true;
    this.elements.modeInputs.forEach((input) => (input.disabled = true));
    this.elements.statusValue.textContent = "Unavailable";
    this.elements.statusValue.className =
      "popup__status-value popup__status-value--inactive";
  }

  bindEvents() {
    this.elements.activateButton.addEventListener("click", () => {
      this.toggleMode();
    });

    this.elements.helpButton.addEventListener("click", () => {
      this.showHelp();
    });

    this.elements.modeInputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        this.currentMode = e.target.value;
        this.updateActivateButtonLabel();
        this.updateHelpSteps();
        if (this.isActive) {
          this.sendSetMode(this.currentMode);
        }
      });
    });
  }

  async checkExtensionStatus() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const response = await this.sendMessage(tab.id, { type: "GET_STATUS" });
    if (response) {
      this.contentScriptAvailable = true;
      this.isActive = response.isActive;
      this.currentMode = response.mode || "delete";
    } else {
      this.showNoConnection();
    }
    this.syncUI();
  }

  async toggleMode() {
    if (!this.contentScriptAvailable) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    if (this.isActive) {
      await this.sendMessage(tab.id, { type: "DEACTIVATE" });
      this.isActive = false;
    } else {
      await this.sendMessage(tab.id, {
        type: "SET_MODE",
        mode: this.currentMode,
      });
      await this.sendMessage(tab.id, { type: "ACTIVATE" });
      this.isActive = true;
    }
    this.syncUI();
  }

  async sendSetMode(mode) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await this.sendMessage(tab.id, { type: "SET_MODE", mode });
    }
  }

  syncUI() {
    if (this.isActive) {
      this.elements.statusValue.textContent = `Active · ${this.modeName(this.currentMode)}`;
      this.elements.statusValue.className =
        "popup__status-value popup__status-value--active";
      this.elements.activateButton.textContent = "Deactivate";
    } else {
      this.elements.statusValue.textContent = "Inactive";
      this.elements.statusValue.className =
        "popup__status-value popup__status-value--inactive";
      this.updateActivateButtonLabel();
    }
    this.syncModeRadio();
    this.updateHelpSteps();
  }

  syncModeRadio() {
    this.elements.modeInputs.forEach((input) => {
      input.checked = input.value === this.currentMode;
    });
  }

  updateActivateButtonLabel() {
    if (!this.isActive) {
      const labels = {
        delete: "Activate delete",
        edit: "Activate edit text",
        screenshot: "Activate screenshot",
        blur: "Activate blur",
      };
      this.elements.activateButton.textContent =
        labels[this.currentMode] || "Activate";
    }
  }

  modeName(mode) {
    const names = {
      delete: "Delete",
      edit: "Edit text",
      screenshot: "Screenshot",
      blur: "Blur",
    };
    return names[mode] || "Delete";
  }

  updateHelpSteps() {
    const steps = {
      delete: [
        'Click "Activate delete" to start',
        "Hover to highlight an element, click to select it",
        'Press Delete or click "Delete element"',
        'Press Ctrl+Z or click "Undo" to restore it',
        "Press Esc to exit the mode",
      ],
      edit: [
        'Click "Activate edit text" to start',
        "Hover text (paragraphs, headings, spans), then click it",
        "Type your changes inline",
        "Enter saves, Shift+Enter adds a line, clicking away saves",
        'Esc cancels, or click "Save & exit" to finish',
      ],
      screenshot: [
        'Click "Activate screenshot" to start',
        "Hover to highlight an element, click to select it",
        'Click "Capture screenshot" in the side panel',
        "The full element is captured, even if scrolled off-screen",
        "PNG is saved to your Downloads folder",
      ],
      blur: [
        'Click "Activate blur" to start',
        "Click one or more elements to preview the blur",
        'Click "Apply & save blurs (N)" to persist them',
        "Blurs re-apply on reload, scoped to this site",
        "Esc clears unsaved previews and exits",
      ],
    };

    const list = this.elements.helpSteps;
    list.innerHTML = steps[this.currentMode]
      .map((s) => `<li>${s}</li>`)
      .join("");
  }

  showHelp() {
    const helpDiv = document.createElement("div");
    helpDiv.className = "popup__help-overlay";
    helpDiv.innerHTML = `
      <div class="popup__help-content">
        <h2>PageSurgeon help</h2>
        <div class="popup__help-section">
          <strong>Modes</strong>
          <p>Delete — Remove elements from the page</p>
          <p>Edit text — Edit text content inline</p>
          <p>Screenshot — Capture element screenshots</p>
          <p>Blur — Blur elements persistently</p>
        </div>
        <div class="popup__help-section">
          <strong>Keyboard shortcuts</strong>
          <p>• Escape: Exit current mode</p>
          <p>• Delete: Delete selected element (Delete mode)</p>
          <p>• Ctrl+Z: Undo deletion (Delete mode)</p>
          <p>• Enter: Save text (Edit text mode)</p>
          <p>• Shift+Enter: New line (Edit text mode)</p>
        </div>
        <div class="popup__help-section">
          <strong>Blur mode</strong>
          <p>Click several elements to queue them, then apply the batch. Blurs are saved to browser storage and re-apply when you visit the site again.</p>
        </div>
        <button class="popup__button popup__button--primary" id="helpCloseBtn">Got it</button>
      </div>
    `;
    document.body.appendChild(helpDiv);
    document.getElementById("helpCloseBtn").addEventListener("click", () => {
      helpDiv.remove();
    });
    helpDiv.addEventListener("click", (e) => {
      if (e.target === helpDiv) helpDiv.remove();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
