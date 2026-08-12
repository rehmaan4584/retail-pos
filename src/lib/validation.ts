import { CartItem, Product } from "@/types/pos";

/**
 * Discriminated union: either valid, or invalid with a human-readable reason.
 * Boolean alone cannot explain *why* checkout failed.
 */
export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Business rules for an order — pure, no React, no HTTP.
 *
 * WHY catalog is passed in:
 * - Stock must be checked against authoritative product data
 * - We never mutate `catalog` (read-only lookup via find)
 * - Server and client can both call this with the same products array
 *
 * Fundamentals: arrays (every/find), boolean short-circuit, TypeScript unions
 */
export default function validateOrder(
  cart: CartItem[],
  customerName: string,
  customerPhone: string,
  catalog: Product[]
): ValidationResult {
  if (cart.length === 0) {
    return { ok: false, message: "Cart is empty. Add at least one product." };
  }

  if (customerName.trim().length === 0) {
    return { ok: false, message: "Customer name is required." };
  }

  if (customerPhone.trim().length === 0) {
    return { ok: false, message: "Customer phone is required." };
  }

  for (const item of cart) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return {
        ok: false,
        message: `Invalid quantity for ${item.name || `product #${item.id}`}.`,
      };
    }

    if (!Number.isInteger(item.quantity)) {
      return {
        ok: false,
        message: `Quantity for ${item.name || `product #${item.id}`} must be a whole number.`,
      };
    }

    // find: locate catalog product by id without mutating either array
    const product = catalog.find((p) => p.id === item.id);
    if (!product) {
      return {
        ok: false,
        message: `Unknown product (id ${item.id}).`,
      };
    }

    if (item.quantity > product.stock) {
      return {
        ok: false,
        message: `Not enough stock for ${product.name}. Requested ${item.quantity}, available ${product.stock}.`,
      };
    }
  }

  return { ok: true };
}
