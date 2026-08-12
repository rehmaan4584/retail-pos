import { CartItem, Order } from "@/types/pos";

/** Shared tax rate — single source of truth for client display and server calc. */
export const TAX_RATE = 0.02;

export interface OrderInput {
  customerName: string;
  customerPhone: string;
  cartItems: CartItem[];
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Pure money math from cart lines.
 * - reduce: walks the array once and accumulates price * quantity
 * - No React, no I/O — same inputs always yield the same outputs
 */
export function calculateTotals(cartItems: CartItem[]): OrderTotals {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

/**
 * Builds a full Order object from customer + cart.
 * Presentation and the API both call this so totals stay consistent.
 */
export default function calculateOrder({
  customerName,
  customerPhone,
  cartItems,
}: OrderInput): Order {
  const { subtotal, tax, total } = calculateTotals(cartItems);

  return {
    customer: { name: customerName, phone: customerPhone },
    items: cartItems,
    subtotal,
    tax,
    total,
  };
}
