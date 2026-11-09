class ModeController {
  constructor() {
    this.modes = {
      delete: new DeleteMode(),
      edit: new EditMode(),
      screenshot: new ScreenshotMode(),
      blur: new BlurMode(),
    };

    this.currentMode = null;
    this.currentModeName = "delete";
    this.isActive = false;
    this.hoveredElement = null;
    this.selectedElement = null;
    this.highlightBox = null;
    this.sidePanel = null;
    this.isInitialized = false;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleElementClick = this.handleElementClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.init();
  }

  init() {
    if (this.isInitialized) return;
    try {
      this.createSidePanel();
      this.bindEvents();
      this.applyPersistentBlurs();
      this.isInitialized = true;
    } catch (error) {
      console.error("PageSurgeon init failed:", error);
    }
  }

  async applyPersistentBlurs() {
    try {
      const { blurRules = [] } = await chrome.storage.local.get("blurRules");
      const rules = blurRules.filter((r) => {
        const ruleHost = r.urlPattern.replace(/\/\*$/, "");
        return location.hostname === ruleHost;
      });

      for (const rule of rules) {
        const el = document.querySelector(rule.selector);
        if (el) {
          el.style.filter = `blur(${rule.blurPx}px)`;
          el.style.pointerEvents = "none";
          el.style.userSelect = "none";
        }
      }

      if (rules.length > 0) {
        const observer = new MutationObserver(() => {
          for (const rule of rules) {
            const el = document.querySelector(rule.selector);
            if (el && !el.style.filter) {
              el.style.filter = `blur(${rule.blurPx}px)`;
              el.style.pointerEvents = "none";
              el.style.userSelect = "none";
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    } catch (error) {
      console.error("Failed to apply persistent blurs:", error);
    }
  }

  createSidePanel() {
    this.sidePanel = document.createElement("div");
    this.sidePanel.className = "pagesurgeon-panel";
    this.sidePanel.innerHTML = `
      <div class="pagesurgeon-panel__header">
        <div class="pagesurgeon-panel__heading">
          <h3 class="pagesurgeon-panel__title">PageSurgeon</h3>
          <p class="pagesurgeon-panel__subtitle">Surgical page editing</p>
        </div>
        <button class="pagesurgeon-panel__close" id="panelCloseBtn" type="button" title="Exit" aria-label="Exit PageSurgeon">
          ${DomUtils.icon("x")}
        </button>
      </div>
      <div class="pagesurgeon-panel__body">
        <div class="pagesurgeon-panel__status" role="status">
          <span class="pagesurgeon-panel__status-dot"></span>
          <span class="pagesurgeon-panel__status-text" id="panelStatus">Ready</span>
        </div>
        <div class="pagesurgeon-panel__actions" id="panelActions"></div>
      </div>
      <div class="pagesurgeon-panel__footer">
        <span>Esc to exit</span>
        <span>v${chrome.runtime.getManifest().version}</span>
      </div>
    `;
    document.body.appendChild(this.sidePanel);

    const closeBtn = this.sidePanel.querySelector("#panelCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.deactivate());
    }
  }

  bindEvents() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (!sender || sender.id !== chrome.runtime.id) return false;

      switch (request.type) {
        case "SET_MODE":
          if (!this.modes[request.mode]) {
            sendResponse({ success: false, error: "Unknown mode" });
            break;
          }
          this.setMode(request.mode);
          sendResponse({ success: true });
          break;
        case "ACTIVATE":
          this.activate();
          sendResponse({ success: true });
          break;
        case "DEACTIVATE":
          this.deactivate();
          sendResponse({ success: true });
          break;
        case "GET_STATUS":
          sendResponse({
            isActive: this.isActive,
            mode: this.currentModeName,
          });
          break;
      }
      return false;
    });
  }

  setMode(modeName) {
    if (this.currentMode && this.isActive) {
      this.currentMode.deactivate();
    }
    this.currentModeName = modeName;
    this.currentMode = this.modes[modeName];
    this.clearSelection();
    if (this.isActive) {
      this.currentMode.activate(this);
    }
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;
    this.currentMode = this.modes[this.currentModeName];
    this.sidePanel.classList.add("pagesurgeon-panel--visible");
    this.enableElementSelection();
    this.currentMode.activate(this);
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this.sidePanel.classList.remove("pagesurgeon-panel--visible");
    this.disableElementSelection();
    this.clearSelection();
    if (this.currentMode) {
      this.currentMode.deactivate();
    }
  }

  enableElementSelection() {
    document.body.classList.add("pagesurgeon-cursor");
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("click", this.handleElementClick, true);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  disableElementSelection() {
    document.body.classList.remove("pagesurgeon-cursor");
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("click", this.handleElementClick, true);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleMouseMove(event) {
    if (!this.isActive) return;
    const target = event.target;
    if (!target || DomUtils.isExtensionElement(target) || target === this.hoveredElement) return;
    if (this.selectedElement && this.currentModeName !== "blur") return;
    this.hoveredElement = target;
    if (this.currentMode) {
      this.currentMode.onHover(target);
    }
  }

  handleElementClick(event) {
    if (!this.isActive) return;
    const target = event.target;
    if (!target || DomUtils.isExtensionElement(target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.currentMode) {
      this.hoveredElement = target;
      this.currentMode.onSelect(target);
    }
  }

  handleKeyDown(event) {
    if (!this.isActive) return;
    if (event.key === "Escape") {
      event.preventDefault();
      if (this.currentMode) {
        this.currentMode.onEscape();
      }
      this.deactivate();
    } else if (event.key === "Delete" && this.currentModeName === "delete") {
      event.preventDefault();
      this.currentMode.onAction();
    } else if ((event.ctrlKey || event.metaKey) && event.key === "z" && this.currentModeName === "delete") {
      event.preventDefault();
      this.currentMode.onUndo();
    } else if (event.key === "Enter" && this.currentModeName === "edit") {
      this.currentMode.onAction();
    }
  }

  showHighlight(element) {
    if (!this.highlightBox) {
      this.highlightBox = document.createElement("div");
      this.highlightBox.className = "pagesurgeon-highlight";
      document.body.appendChild(this.highlightBox);
    }
    const rect = element.getBoundingClientRect();
    const radius = window.getComputedStyle(element).borderRadius;
    this.highlightBox.style.left = `${rect.left + window.scrollX}px`;
    this.highlightBox.style.top = `${rect.top + window.scrollY}px`;
    this.highlightBox.style.width = `${rect.width}px`;
    this.highlightBox.style.height = `${rect.height}px`;
    this.highlightBox.style.borderRadius =
      radius && radius !== "0px" ? radius : "4px";
    if (element !== this.selectedElement) {
      this.highlightBox.classList.remove("pagesurgeon-highlight--selected");
    }
  }

  hideHighlight() {
    if (this.highlightBox) {
      this.highlightBox.style.display = "none";
    }
  }

  highlightAsSelected() {
    if (this.highlightBox) {
      this.highlightBox.classList.add("pagesurgeon-highlight--selected");
    }
  }

  clearSelection() {
    this.selectedElement = null;
    this.hoveredElement = null;
    if (this.highlightBox) {
      this.highlightBox.remove();
      this.highlightBox = null;
    }
  }

  updatePanelContent(html) {
    const actions = document.getElementById("panelActions");
    if (actions) {
      actions.innerHTML = html;
    }
    const cancelBtn = document.getElementById("modeCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.deactivate());
    }
    const actionBtn = document.getElementById("modeActionBtn");
    if (actionBtn) {
      actionBtn.addEventListener("click", () => {
        this.currentMode.onAction();
        if (this.currentModeName === "edit") {
          this.deactivate();
        }
      });
    }
    const undoBtn = document.getElementById("modeUndoBtn");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => this.currentMode.onUndo());
    }
  }

  updateStatus(text) {
    const statusEl =
      this.sidePanel?.querySelector("#panelStatus") ||
      document.getElementById("panelStatus");
    if (statusEl) {
      statusEl.innerHTML = text;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new ModeController());
} else {
  new ModeController();
}
