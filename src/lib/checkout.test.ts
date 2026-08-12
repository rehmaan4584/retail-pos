/**
 * POS logic verification — pure functions only (no React).
 * Run: npx --yes tsx --test src/lib/checkout.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import calculateOrder, { calculateTotals, TAX_RATE } from "./order";
import validateOrder from "./validation";
import { products } from "../data/products";
import type { CartItem } from "../types/pos";

function item(
  productId: number,
  quantity: number,
  overrides: Partial<CartItem> = {}
): CartItem {
  const product = products.find((p) => p.id === productId);
  assert.ok(product, `product ${productId} must exist`);
  return { ...product, quantity, ...overrides };
}

describe("calculateTotals / calculateOrder", () => {
  it("computes correct subtotal, tax, and grand total", () => {
    const cart = [item(1, 2), item(2, 1)];
    // 1199*2 + 999 = 3397; tax 2% = 67.94; total = 3464.94
    const totals = calculateTotals(cart);
    assert.equal(totals.subtotal, 3397);
    assert.equal(totals.tax, 3397 * TAX_RATE);
    assert.equal(totals.total, totals.subtotal + totals.tax);
  });

  it("updates totals when quantity changes", () => {
    const one = calculateTotals([item(5, 1)]);
    const two = calculateTotals([item(5, 2)]);
    assert.equal(two.subtotal, one.subtotal * 2);
    assert.equal(two.tax, one.tax * 2);
    assert.equal(two.total, one.total * 2);
  });

  it("builds an Order object with customer + money fields", () => {
    const cart = [item(4, 1)];
    const order = calculateOrder({
      customerName: "Alex",
      customerPhone: "555-0100",
      cartItems: cart,
    });
    assert.equal(order.customer.name, "Alex");
    assert.equal(order.items.length, 1);
    assert.equal(order.subtotal, 799);
    assert.equal(order.tax, 799 * TAX_RATE);
    assert.equal(order.total, order.subtotal + order.tax);
  });

  it("returns zero totals for an empty cart", () => {
    const totals = calculateTotals([]);
    assert.deepEqual(totals, { subtotal: 0, tax: 0, total: 0 });
  });
});

describe("validateOrder", () => {
  it("rejects an empty cart", () => {
    const result = validateOrder([], "Alex", "555", products);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.message, /empty/i);
  });

  it("rejects missing customer name", () => {
    const result = validateOrder([item(1, 1)], "  ", "555", products);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.message, /name/i);
  });

  it("rejects missing phone", () => {
    const result = validateOrder([item(1, 1)], "Alex", "", products);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.message, /phone/i);
  });

  it("rejects invalid quantity (<= 0)", () => {
    const result = validateOrder([item(1, 0)], "Alex", "555", products);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.message, /quantity/i);
  });

  it("rejects quantity exceeding stock", () => {
    const overstock = item(1, products[0].stock + 1);
    const result = validateOrder([overstock], "Alex", "555", products);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.message, /stock/i);
  });

  it("accepts a valid order", () => {
    const result = validateOrder([item(1, 1)], "Alex", "555-0142", products);
    assert.equal(result.ok, true);
  });

  it("does not mutate the catalog when validating", () => {
    const snapshot = structuredClone(products);
    validateOrder([item(1, 1)], "Alex", "555", products);
    assert.deepEqual(products, snapshot);
  });
});
