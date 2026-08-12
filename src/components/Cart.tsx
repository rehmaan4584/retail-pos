"use client";

import { CartItem } from "@/types/pos";
import { calculateTotals, TAX_RATE } from "@/lib/order";

interface CartProps {
  cart: CartItem[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function Cart({ cart }: CartProps) {
  // Totals live in lib/order — Cart only presents them (separation of concerns).
  // When `cart` prop changes, React re-renders and these values update immediately.
  const { subtotal, tax, total } = calculateTotals(cart);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const taxPercent = Math.round(TAX_RATE * 100);

  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label="Shopping cart"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
          Cart
        </h2>
        <span className="text-xs font-medium text-[var(--muted)] tabular-nums">
          {itemCount === 0
            ? "Empty"
            : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-sunken)] px-4 py-10 text-center">
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--muted-light)] shadow-[var(--shadow-sm)]"
            aria-hidden="true"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.18 3a65.25 65.25 0 0113.36 1.17.75.75 0 01.58.875 48.645 48.645 0 01-1.618 6.2.75.75 0 01-.712.513H6a2.25 2.25 0 00-2.115 1.483l-.792 2.407a.75.75 0 01-.712.513H2.75a.75.75 0 010-1.5h.163l.67-2.036A3.75 3.75 0 016 8.25h9.37a47.07 47.07 0 001.228-4.705A63.75 63.75 0 005.29 2.5l-.07-.29A.25.25 0 005.378 2H1.75A.75.75 0 011 1.25v.5z" />
              <path d="M6 17.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM15.75 17.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Cart is empty
          </p>
          <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-[var(--muted)]">
            Tap a product to add it. Quantities increase when you select the
            same item again.
          </p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {cart.map((c) => {
            const lineTotal = c.price * c.quantity;
            return (
              <li
                key={c.id}
                className="rounded-[var(--radius-sm)] border border-transparent bg-[var(--surface-sunken)]/80 px-3 py-2.5 transition-colors hover:border-[var(--border)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {c.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)] tabular-nums">
                      {formatPrice(c.price)} each
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    {formatPrice(lineTotal)}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[0.65rem] font-medium tracking-wide text-[var(--muted)] uppercase">
                    Qty
                  </span>
                  <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    {c.quantity}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Subtotal</span>
          <span className="font-medium tabular-nums text-[var(--foreground)]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">Tax ({taxPercent}%)</span>
          <span className="font-medium tabular-nums text-[var(--foreground)]">
            {formatPrice(tax)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Grand Total
          </span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-[var(--accent)]">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </section>
  );
}
