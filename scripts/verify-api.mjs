/**
 * API integration checks against a running Next.js server.
 * Usage: npm run dev  (elsewhere) then  node scripts/verify-api.mjs
 */
const BASE = process.env.POS_BASE_URL ?? "http://localhost:3000";

async function postCheckout(body) {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const validBody = {
    customer: { name: "Alex Rivera", phone: "555-0142" },
    items: [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }],
    // Deliberately wrong client totals — server must ignore these
    subtotal: 1,
    tax: 1,
    total: 1,
  };

  // Empty cart
  {
    const { res, data } = await postCheckout({
      customer: { name: "A", phone: "1" },
      items: [],
    });
    assert(res.status === 400, "empty cart → 400");
    assert(data?.success === false, "empty cart → success false");
  }

  // Missing name
  {
    const { res, data } = await postCheckout({
      customer: { name: "", phone: "555" },
      items: [{ id: 1, quantity: 1 }],
    });
    assert(res.status === 400, "missing name → 400");
    assert(String(data?.error).toLowerCase().includes("name"), "name error");
  }

  // Missing phone
  {
    const { res, data } = await postCheckout({
      customer: { name: "Alex", phone: "" },
      items: [{ id: 1, quantity: 1 }],
    });
    assert(res.status === 400, "missing phone → 400");
    assert(String(data?.error).toLowerCase().includes("phone"), "phone error");
  }

  // Invalid quantity
  {
    const { res, data } = await postCheckout({
      customer: { name: "Alex", phone: "555" },
      items: [{ id: 1, quantity: 0 }],
    });
    assert(res.status === 400, "qty 0 → 400");
    assert(data?.success === false, "qty 0 → fail");
  }

  // Over stock
  {
    const { res, data } = await postCheckout({
      customer: { name: "Alex", phone: "555" },
      items: [{ id: 1, quantity: 9999 }],
    });
    assert(res.status === 400, "overstock → 400");
    assert(String(data?.error).toLowerCase().includes("stock"), "stock error");
  }

  // Success + authoritative totals
  {
    const { res, data } = await postCheckout(validBody);
    assert(res.ok, "success → response.ok");
    assert(data?.success === true, "success flag");
    assert(data.order.subtotal === 3397, `subtotal got ${data.order.subtotal}`);
    assert(
      Math.abs(data.order.tax - 67.94) < 0.001,
      `tax got ${data.order.tax}`
    );
    assert(
      Math.abs(data.order.total - 3464.94) < 0.001,
      `total got ${data.order.total}`
    );
    // Prove client totals were ignored
    assert(data.order.total !== 1, "ignored client total");
  }

  // Invalid JSON / bad body
  {
    const res = await fetch(`${BASE}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert(res.status === 400, "bad JSON → 400");
  }

  console.log("API verification passed.");
}

main().catch((err) => {
  console.error("API verification failed:", err.message);
  process.exit(1);
});
