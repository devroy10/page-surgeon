chrome.runtime.onInstalled.addListener(() => {
  console.log("PageSurgeon installed successfully.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!sender || sender.id !== chrome.runtime.id || !sender.tab) {
    return false;
  }

  if (request.type === "CAPTURE_ELEMENT") {
    const rect = normalizeRect(request.rect);
    if (!rect) {
      sendResponse({ success: false, error: "Invalid capture rectangle" });
      return false;
    }

    captureElement(sender.tab.windowId, rect, normalizeDpr(request.dpr))
      .then((dataUrl) => {
        downloadImage(dataUrl, request.filename, sendResponse);
      })
      .catch((err) => {
        console.error("Capture failed:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (request.type === "CAPTURE_TILE") {
    captureTile(sender.tab.windowId, normalizeDpr(request.dpr))
      .then((dataUrl) => sendResponse({ dataUrl }))
      .catch((err) => {
        console.error("Tile capture failed:", err);
        sendResponse({ error: err.message });
      });
    return true;
  }

  if (request.type === "DOWNLOAD_BLOB") {
    if (!isPngDataUrl(request.url)) {
      sendResponse({ success: false, error: "Invalid image data" });
      return false;
    }

    downloadImage(request.url, request.filename, sendResponse);
    return true;
  }

  return false;
});

function normalizeRect(rect) {
  if (!rect || typeof rect !== "object") return null;

  const [left, top, width, height] = ["left", "top", "width", "height"].map(
    (key) => Number(rect[key])
  );

  if (![left, top, width, height].every(Number.isFinite)) return null;
  if (width <= 0 || height <= 0 || width > 20000 || height > 20000) return null;

  return { left, top, width, height };
}

function normalizeDpr(value) {
  const dpr = Number(value);
  if (!Number.isFinite(dpr) || dpr <= 0) return 1;
  return Math.min(Math.max(dpr, 1), 4);
}

function isPngDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:image/png;base64,");
}

function safeFilename(filename) {
  const fallback = `pagesurgeon-${Date.now()}.png`;
  if (typeof filename !== "string") return fallback;

  const base = filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 120);

  return /\.png$/i.test(base) ? base : fallback;
}

function downloadImage(dataUrl, filename, sendResponse) {
  chrome.downloads.download(
    {
      url: dataUrl,
      filename: safeFilename(filename),
      saveAs: false,
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }
      sendResponse({ success: true, downloadId });
    }
  );
}

async function captureElement(windowId, rect, dpr) {
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  const blob = await (await fetch(dataUrl)).blob();
  const img = await createImageBitmap(blob);

  const sx = Math.round(rect.left * dpr);
  const sy = Math.round(rect.top * dpr);
  const sw = Math.max(1, Math.round(rect.width * dpr));
  const sh = Math.max(1, Math.round(rect.height * dpr));

  if (sw > 16384 || sh > 16384 || sw * sh > 100000000) {
    throw new Error("Capture area is too large");
  }

  const canvas = new OffscreenCanvas(sw, sh);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
  return blobToDataUrl(croppedBlob);
}

async function captureTile(windowId, dpr) {
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  const blob = await (await fetch(dataUrl)).blob();
  const img = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);

  const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
  return blobToDataUrl(croppedBlob);
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
