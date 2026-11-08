import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "center",
  closeLabel = "Close dialog",
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel ? panel.querySelectorAll(FOCUSABLE) : [];
    const firstFocusable = focusables[0] || panel;
    firstFocusable?.focus?.();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (item) => item.offsetParent !== null
      );
      if (!items.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const isDrawer = variant === "drawer";

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex ${
        isDrawer ? "justify-start" : "items-end justify-center p-4 sm:items-center"
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close dialog overlay"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={
          isDrawer
            ? "relative flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-surface shadow-pop"
            : "relative max-h-[min(90vh,42rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-pop"
        }
      >
        {title && (
          <h2
            id={titleId}
            className={
              isDrawer ? "sr-only" : "pr-8 text-lg font-semibold text-fg"
            }
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            id={descriptionId}
            className={
              isDrawer
                ? "sr-only"
                : "mt-1.5 pr-8 text-sm leading-6 text-fg-muted"
            }
          >
            {description}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg ${
            isDrawer ? "" : "right-4 top-4"
          }`}
          aria-label={closeLabel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div
          className={
            isDrawer
              ? "flex-1 px-4 pb-4 pt-12"
              : title || description
                ? "mt-4"
                : "pr-8"
          }
        >
          {children}
        </div>

        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
