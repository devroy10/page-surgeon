class DomUtils {
  static isExtensionElement(element) {
    return (
      element &&
      (!!element.closest(".pagesurgeon-panel") ||
        element.classList.contains("pagesurgeon-highlight"))
    );
  }

  static icon(name, size = 16) {
    const paths = {
      trash:
        '<path d="M2.5 4.5h11M6 4.5V3.2c0-.4.3-.7.7-.7h2.6c.4 0 .7.3.7.7v1.3M4 4.5l.6 8.4c0 .6.5 1.1 1.1 1.1h4.6c.6 0 1.1-.5 1.1-1.1l.6-8.4M6.5 7v4.5M9.5 7v4.5"/>',
      undo:
        '<path d="M3 7h7.2a3.3 3.3 0 0 1 0 6.6H7M3 7l2.5-2.5M3 7l2.5 2.5"/>',
      x: '<path d="M4 4l8 8M12 4l-8 8"/>',
      check: '<path d="M3 8.5 6.5 12 13 4.5"/>',
      camera:
        '<path d="M2 5.5c0-.6.4-1 1-1h1.7l.8-1.2c.2-.2.4-.3.7-.3h3.6c.3 0 .5.1.7.3l.8 1.2H13c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1z"/><circle cx="8" cy="8.5" r="2.2"/>',
      blur:
        '<path d="M8 2.5c2.2 2.6 3.5 4.4 3.5 6.1a3.5 3.5 0 1 1-7 0c0-1.7 1.3-3.5 3.5-6.1z"/>',
    };

    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
  }

  static getElementDescription(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const cls = element.className && typeof element.className === "string"
      ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
      : "";
    const text = element.textContent
      ? element.textContent.trim().slice(0, 30)
      : "";
    return `<${tag}${id}${cls}>${text ? ` "${text}"` : ""}`;
  }

  static isTextElement(element) {
    const textTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a",
      "li", "td", "th", "label", "figcaption", "blockquote", "cite",
      "strong", "em", "b", "i", "u", "small", "sub", "sup", "button"];
    if (textTags.includes(element.tagName.toLowerCase())) return true;
    if (["div", "section", "article"].includes(element.tagName.toLowerCase())) {
      return element.children.length === 0;
    }
    return false;
  }
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
