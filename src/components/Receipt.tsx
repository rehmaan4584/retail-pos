"use client";

import { Order } from "@/types/pos";
import { TAX_RATE } from "@/lib/order";

interface ReceiptProps {
  order: Order;
  onClose: () => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Receipt is a presentational snapshot of a completed Order.
 * Print uses the browser print dialog — no extra dependencies.
 */
export default function Receipt({ order, onClose }: ReceiptProps) {
  const taxPercent = Math.round(TAX_RATE * 100);
  const issuedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
    >
      <div className="flex max-h-[min(90vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-md)] print:max-h-none print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 print:hidden">
          <h2
            id="receipt-title"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Sale complete
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Close
          </button>
        </div>

        <div
          id="pos-receipt"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-[var(--foreground)]"
        >
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold tracking-tight">RetailPOS</p>
            <p className="text-xs text-[var(--muted)]">Sales receipt</p>
            <p className="mt-1 text-xs text-[var(--muted)] tabular-nums">
              {issuedAt}
            </p>
          </div>

          <div className="mb-4 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] px-3 py-2.5 text-sm">
            <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
              Customer
            </p>
            <p className="mt-1 font-medium">{order.customer.name}</p>
            <p className="text-[var(--muted)] tabular-nums">
              {order.customer.phone}
            </p>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted)]">
                <th className="py-2 pr-2 font-medium">Item</th>
                <th className="py-2 pr-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)]/70">
                  <td className="py-2.5 pr-2 align-top">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[var(--muted)] tabular-nums">
                      {formatPrice(item.price)} each
                    </p>
                  </td>
                  <td className="py-2.5 pr-2 text-right align-top tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right align-top font-medium tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Subtotal</span>
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tax ({taxPercent}%)</span>
              <span className="tabular-nums">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold">
              <span>Grand Total</span>
              <span className="tabular-nums text-[var(--accent)]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-[var(--border)] p-4 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Print receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius)] bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
