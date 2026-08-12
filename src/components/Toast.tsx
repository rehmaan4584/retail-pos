"use client";

import { useEffect } from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const toneStyles: Record<
  ToastTone,
  { bar: string; icon: string; label: string }
> = {
  success: {
    bar: "bg-[var(--success)]",
    icon: "text-[var(--success)]",
    label: "Success",
  },
  error: {
    bar: "bg-[var(--danger)]",
    icon: "text-[var(--danger)]",
    label: "Error",
  },
  info: {
    bar: "bg-[var(--accent)]",
    icon: "text-[var(--accent)]",
    label: "Notice",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4200);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = toneStyles[toast.tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-md)]"
    >
      <div className={`w-1 shrink-0 ${styles.bar}`} aria-hidden="true" />
      <div className="flex flex-1 items-start gap-3 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            <span className={`mr-1.5 text-xs font-medium ${styles.icon}`}>
              {styles.label}
            </span>
            {toast.title}
          </p>
          {toast.description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
              {toast.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label="Dismiss notification"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * Lightweight toast viewport — no third-party library.
 * Parent owns toast state; this component only renders + auto-dismisses.
 */
export default function ToastViewport({
  toasts,
  onDismiss,
}: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
