import type { ReactNode } from "react";

interface CustomerFormProps {
  customerName: string;
  customerPhone: string;
  onChangeName: (n: string) => void;
  onChangePhone: (p: string) => void;
  handleCheckout: () => void;
  isSubmitting?: boolean;
  children?: ReactNode;
}

export default function CustomerForm({
  customerName,
  customerPhone,
  onChangeName,
  onChangePhone,
  handleCheckout,
  isSubmitting = false,
  children,
}: CustomerFormProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
          Customer
        </h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">
          Required for checkout
        </p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSubmitting) handleCheckout();
          }}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-[var(--muted)]"
            >
              Name
            </label>
            <input
              onChange={(e) => onChangeName(e.target.value)}
              type="text"
              name="name"
              id="name"
              placeholder="Customer name"
              value={customerName}
              autoComplete="name"
              disabled={isSubmitting}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-sm)] placeholder:text-[var(--muted-light)] transition-colors hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-[var(--muted)]"
            >
              Phone
            </label>
            <input
              onChange={(e) => onChangePhone(e.target.value)}
              type="tel"
              name="phone"
              id="phone"
              placeholder="Phone number"
              value={customerPhone}
              autoComplete="tel"
              disabled={isSubmitting}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-sm)] placeholder:text-[var(--muted-light)] transition-colors hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </form>
      </div>

      {children}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="mt-auto w-full rounded-[var(--radius)] bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold tracking-wide text-[var(--accent-foreground)] shadow-[var(--shadow-md)] transition-all duration-150 hover:bg-[var(--accent-hover)] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:scale-[0.99] active:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[var(--border-strong)] disabled:text-[var(--muted)] disabled:shadow-none disabled:hover:bg-[var(--border-strong)] disabled:active:scale-100"
      >
        {isSubmitting ? "Processing…" : "Complete Sale"}
      </button>
    </div>
  );
}
