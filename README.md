# RetailPOS

A premium Point of Sale (POS) prototype built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

Designed as a portfolio project to demonstrate clean frontend architecture, client/server separation, validation, and a production-style checkout flow — without a real database.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square)

## Live site

> Add your Vercel URL here after deploy: `https://your-app.vercel.app`

## Features

- Desktop-first POS workspace (catalog + checkout panel)
- Product search and add-to-cart with quantity handling
- Live cart totals: **subtotal → tax → grand total**
- Customer checkout form with loading / success / error states
- Toast notifications for validation and API feedback
- Receipt view with browser print support
- Server-side validation and authoritative order calculation
- In-memory product catalog (no database required)

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| API | Route Handler `POST /api/checkout` |
| Data | Dummy products in `src/data/products.ts` |

## Architecture

```
src/
├── app/
│   ├── page.tsx                 # UI state + checkout orchestration
│   └── api/checkout/route.ts    # HTTP boundary (validate + calculate)
├── components/                  # Presentational UI
├── data/products.ts             # Mock catalog
├── lib/
│   ├── order.ts                 # Pure money math
│   └── validation.ts            # Pure business rules
└── types/pos.ts                 # Shared contracts
```

**Design principle:** the browser never owns the final totals. The server re-validates the cart against catalog stock and recalculates subtotal, tax, and grand total.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run test:logic` | Unit tests (order + validation) |
| `npm run test:api` | API checks (requires `npm run dev`) |

## Checkout flow

1. Add products to the cart  
2. Enter customer name and phone  
3. Client validates quickly for UX  
4. `POST /api/checkout` validates again on the server  
5. Server recalculates totals (client money fields are ignored)  
6. Success → toast + printable receipt  

## What this project shows

- Separation of concerns (UI vs business logic vs HTTP)
- Pure functions for money and validation
- TypeScript contracts across client and server
- Async checkout with duplicate-submit protection
- Accessible, portfolio-ready retail UI

## License

MIT — feel free to fork and adapt for learning or portfolio use.
