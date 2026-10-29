/**
 * Runs inside the user-invoked tab using chrome.scripting.executeScript.
 * Self-contained by design: do not import external functions inside this function.
 * Does NOT read DOM field values, cookies, page text, or form submissions.
 */
export function injectedPicker(): void {
  const global = window as Window & { __reproRelayCleanup?: () => void };
  global.__reproRelayCleanup?.();

  const overlay = document.createElement("div");
  const banner = document.createElement("div");

  Object.assign(overlay.style, {
    position: "fixed",
    zIndex: "2147483646",
    pointerEvents: "none",
    border: "2px solid #725bff",
    background: "rgba(114,91,255,.14)",
    borderRadius: "5px",
    boxSizing: "border-box",
    display: "none",
    inset: "0 auto auto 0",
  });
  Object.assign(banner.style, {
    position: "fixed",
    zIndex: "2147483647",
    pointerEvents: "none",
    top: "12px",
    left: "12px",
    color: "white",
    background: "#26213f",
    padding: "12px 16px",
    borderRadius: "10px",
    font: "600 13px system-ui, sans-serif",
    boxShadow: "0 6px 24px rgba(0,0,0,.2)",
  });
  banner.textContent = "ReproRelay: click an element · Esc to cancel";
  document.documentElement.append(overlay, banner);

  function elementSelector(element: Element): string {
    const parts: string[] = [];
    let current: Element | null = element;
    while (current && parts.length < 6) {
      if (current.id) {
        parts.unshift(`#${CSS.escape(current.id)}`);
        break;
      }
      let piece = current.tagName.toLowerCase();
      const classes = Array.from(current.classList).slice(0, 2);
      piece += classes.map((name) => `.${CSS.escape(name)}`).join("");

      const parent: Element | null = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.tagName === current?.tagName,
        );
        if (siblings.length > 1) {
          piece += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }
      parts.unshift(piece);
      current = parent;
    }
    return parts.join(" > ");
  }

  function onMove(event: MouseEvent) {
    const element = event.target;
    if (!(element instanceof Element) || element === overlay || element === banner) return;
    const rect = element.getBoundingClientRect();
    Object.assign(overlay.style, {
      display: "block",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

  function cleanup() {
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeydown, true);
    overlay.remove();
    banner.remove();
    global.__reproRelayCleanup = undefined;
  }

  function onClick(event: MouseEvent) {
    const element = event.target;
    if (!(element instanceof Element) || element === overlay || element === banner) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const selection = {
      selector: elementSelector(element),
      tag: element.tagName.toLowerCase(),
      // Exclude query strings/fragments, which frequently contain tokens.
      pageUrl: `${location.origin}${location.pathname}`,
      selectedAt: new Date().toISOString(),
    };
    cleanup();
    void chrome.storage.local
      .set({ rrSelection: selection })
      .catch(() => {
        // Fail safely: do not send page data anywhere if local storage fails.
      });
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") cleanup();
  }

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeydown, true);
  global.__reproRelayCleanup = cleanup;
}
