"use client";

import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import CustomerForm from "@/components/CustomerForm";
import ToastViewport, { ToastMessage, ToastTone } from "@/components/Toast";
import Receipt from "@/components/Receipt";
import { useCallback, useState } from "react";
import { CartItem, CheckoutResponse, Order, Product } from "@/types/pos";
import { products } from "@/data/products";
import validateOrder from "@/lib/validation";
import calculateOrder from "@/lib/order";

export default function Home() {
  // --- State ownership lives here (single source of truth for the sale) ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      // Keep at most 3 toasts — avoids stacking noise
      setToasts((prev) => [...prev.slice(-2), { id, tone, title, description }]);
    },
    []
  );

  const handleCustomerName = (n: string) => {
    setCustomerName(n);
  };

  const handleCustomerPhone = (p: string) => {
    setCustomerPhone(p);
  };

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleCheckout = async () => {
    // Guard: closures over isSubmitting prevent duplicate in-flight requests
    if (isSubmitting) return;

    // Client-side validation first (fast feedback; server still re-validates)
    const validation = validateOrder(
      cart,
      customerName,
      customerPhone,
      products
    );

    if (!validation.ok) {
      pushToast("error", "Cannot checkout", validation.message);
      return;
    }

    // Preview totals for the request body — server recalculates authoritatively
    const orderPreview = calculateOrder({
      customerName,
      customerPhone,
      cartItems: cart,
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPreview),
      });

      let data: CheckoutResponse;
      try {
        data = (await response.json()) as CheckoutResponse;
      } catch {
        pushToast("error", "Checkout failed", "Server returned an invalid response.");
        return;
      }

      // Always inspect response.ok — JSON may exist on both 200 and 400
      if (!response.ok || !data.success) {
        const message =
          !data.success && data.error
            ? data.error
            : `Request failed (${response.status}).`;
        pushToast("error", "Checkout failed", message);
        return;
      }

      // Success: use server order (authoritative totals), clear sale inputs
      setCompletedOrder(data.order);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      pushToast(
        "success",
        "Sale completed",
        `Grand total ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(data.order.total)}`
      );
    } catch {
      // Network / unexpected failure (fetch threw)
      pushToast(
        "error",
        "Checkout failed",
        "Network error. Check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[var(--background)]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, rgb(13 148 136 / 0.08), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgb(100 116 139 / 0.12), transparent 50%)",
        }}
      />

      <header className="border-b border-[var(--border)] bg-[var(--surface-raised)]/90 shadow-[var(--shadow-sm)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-sm font-bold text-white shadow-[var(--shadow-sm)]"
              aria-hidden="true"
            >
              R
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                RetailPOS
              </p>
              <p className="text-xs text-[var(--muted)]">Front counter</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isSubmitting ? "bg-amber-500" : "bg-[var(--success)]"
                }`}
                aria-hidden="true"
              />
              {isSubmitting ? "Processing" : "Ready"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:gap-5 lg:px-8 lg:py-5">
        <section className="min-h-0 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5 lg:overflow-y-auto">
          <ProductGrid products={products} handleAddToCart={handleAddToCart} />
        </section>

        <aside className="flex w-full shrink-0 flex-col lg:w-[22.5rem] xl:w-[26rem]">
          <div className="flex min-h-0 flex-1 flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-md)] sm:p-5 lg:sticky lg:top-5 lg:max-h-[calc(100vh-6.5rem)]">
            <CustomerForm
              customerName={customerName}
              customerPhone={customerPhone}
              onChangeName={handleCustomerName}
              onChangePhone={handleCustomerPhone}
              handleCheckout={handleCheckout}
              isSubmitting={isSubmitting}
            >
              <Cart cart={cart} />
            </CustomerForm>
          </div>
        </aside>
      </div>

      <footer className="border-t border-[var(--border)] bg-[var(--surface-raised)]/80">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 text-xs text-[var(--muted)] sm:px-6 lg:px-8">
          <p>RetailPOS workspace</p>
          <p className="tabular-nums">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </footer>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      {completedOrder ? (
        <Receipt
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      ) : null}
    </main>
  );
}
