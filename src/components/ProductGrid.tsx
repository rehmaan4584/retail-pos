"use client";

import { useState } from "react";
import { Product } from "@/types/pos";

interface ProductGridProps {
  products: Product[];
  handleAddToCart: (p: Product) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function isRenderableImageSrc(src: string) {
  const value = src.trim();
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("data:")
  );
}

function ProductImage({ name, image }: { name: string; image: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = isRenderableImageSrc(image) && !failed;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--surface-sunken)] to-[var(--border)]/40"
          aria-hidden="true"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-raised)] text-sm font-semibold tracking-wide text-[var(--muted)] shadow-[var(--shadow-sm)]">
            {name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

function stockLabel(stock: number) {
  if (stock <= 0) return { text: "Out of stock", tone: "text-[var(--danger)]" };
  if (stock <= 20) return { text: `${stock} left`, tone: "text-amber-700" };
  return { text: `${stock} in stock`, tone: "text-[var(--muted)]" };
}

export default function ProductGrid({
  products,
  handleAddToCart,
}: ProductGridProps) {
  const [query, setQuery] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-4"
      aria-label="Products"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
            Catalog
          </h2>
          <p className="mt-0.5 text-lg font-semibold text-[var(--foreground)]">
            Select products
          </p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search products</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-light)]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] py-2.5 pr-3 pl-9 text-sm text-[var(--foreground)] shadow-[var(--shadow-sm)] placeholder:text-[var(--muted-light)] transition-colors hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-16 text-center">
          <div>
            <p className="font-medium text-[var(--foreground)]">No products found</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Try a different search term
            </p>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p: Product) => {
            const stock = stockLabel(p.stock);

            return (
              <li key={p.id} className="min-h-[17rem]">
                <button
                  type="button"
                  onClick={() => handleAddToCart(p)}
                  aria-label={`Add ${p.name} to cart, ${formatPrice(p.price)}`}
                  className="group flex h-full w-full flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] p-3 text-left shadow-[var(--shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] focus-visible:border-[var(--accent)]"
                >
                  <ProductImage name={p.name} image={p.image} />
                  <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
                    <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                      {p.name}
                    </h3>
                    <div className="mt-auto flex items-end justify-between gap-2">
                      <p className="text-xl font-semibold tracking-tight text-[var(--foreground)] tabular-nums">
                        {formatPrice(p.price)}
                      </p>
                      <span
                        className={`text-xs font-medium ${stock.tone}`}
                        aria-label={`Stock: ${p.stock}`}
                      >
                        {stock.text}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
