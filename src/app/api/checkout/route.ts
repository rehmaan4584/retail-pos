import calculateOrder from "@/lib/order";
import validateOrder from "@/lib/validation";
import { products } from "@/data/products";
import type {
  CartItem,
  CheckoutErrorResponse,
  CheckoutRequestBody,
  CheckoutSuccessResponse,
} from "@/types/pos";

function jsonError(error: string, status: number) {
  const body: CheckoutErrorResponse = { success: false, error };
  return Response.json(body, { status });
}

/**
 * Rebuild cart lines from the product catalog.
 * Client may send prices — we discard them and use server data (trust boundary).
 */
function resolveItemsFromCatalog(
  rawItems: CheckoutRequestBody["items"]
): CartItem[] | null {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return null;
  }

  const resolved: CartItem[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw.id !== "number" || typeof raw.quantity !== "number") {
      return null;
    }

    const product = products.find((p) => p.id === raw.id);
    if (!product) {
      return null;
    }

    // Spread creates a new object — original `products` entry is never mutated
    resolved.push({ ...product, quantity: raw.quantity });
  }

  return resolved;
}

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const customerName = body.customer?.name ?? "";
  const customerPhone = body.customer?.phone ?? "";
  const cartItems = resolveItemsFromCatalog(body.items);

  if (!cartItems) {
    return jsonError("Invalid or empty cart items.", 400);
  }

  // 1) Validate business rules (separate from money math)
  const validation = validateOrder(
    cartItems,
    customerName,
    customerPhone,
    products
  );

  if (!validation.ok) {
    return jsonError(validation.message, 400);
  }

  // 2) Authoritative totals — ignore any client subtotal/tax/total
  const order = calculateOrder({
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    cartItems,
  });

  const success: CheckoutSuccessResponse = {
    success: true,
    order,
    message: "Checkout completed successfully.",
  };

  return Response.json(success, { status: 200 });
}
