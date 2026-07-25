# Plethora of PIES

Plethora of PIES is a Sprint 1 school-project prototype for a pickup-only
pizza restaurant. Customers can browse the menu, customize pizzas, add items
to a cart, apply a promotion code, and complete a simulated checkout.

The current application is entirely client-side. The JSON files under
`src/data` act as temporary sample data; no live database, user accounts,
payment processing, or order submission is connected yet.

## How the application fits together

1. `src/main.jsx` starts React and makes the shared cart available.
2. `src/App.jsx` maps each URL to the correct page.
3. Pages request sample data through files in `src/services`.
4. Components display reusable pieces of the interface.
5. `CartProvider.jsx` stores cart and promotion state for every page.
6. `src/utils/pricing.js` handles reusable price and currency calculations.

## Project map

| Location | Purpose |
| --- | --- |
| `src/pages` | Complete screens: home, menu, customizer, cart, and checkout. |
| `src/components` | Reusable interface pieces shared by pages. |
| `src/context` | Global cart state and the hook used to access it. |
| `src/hooks` | Reusable React behavior, such as temporary notifications. |
| `src/services` | A small data-access layer between pages and sample data. |
| `src/data` | Temporary menu, promotion, restaurant, and gallery data. |
| `src/utils` | Pure helper functions for prices and currency. |
| `tests` | Small automated checks for the shared pricing rules. |
| `public` | Static files copied directly into the production build. |
| `Database/schema.sql` | Proposed PostgreSQL structure for a future database. |
| `electron.cjs` | Desktop window used by the Windows executable. |
| `vite.config.js` | Vite development and production-build configuration. |
| `vercel.json` | Hosting rule that lets client-side routes work on Vercel. |

## Main data flow

- A page calls a service such as `getMenu()`.
- The service reads the current JSON data and returns a Promise, imitating a
  future server request.
- The page stores the result in React state and renders it.
- Adding an item calls `addItem()` from the cart context.
- The cart provider recalculates quantities, subtotal, and discounts.
- Cart and checkout pages read the same shared state with `useCart()`.

All monetary values are stored as integer cents (for example, `1299` means
`$12.99`). This avoids floating-point rounding problems during calculations.

## Common commands

Run these commands from the project folder:

```powershell
npm.cmd install
npm.cmd run dev
```

The development command prints a localhost address. Keep that terminal open
while testing the site.

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run preview
```

- `lint` checks the source for common JavaScript and React mistakes.
- `test` checks shared pricing behavior with Node's built-in test runner.
- `build` creates the production website in `dist`.
- `preview` serves the production website locally for a final browser check.

For the desktop version:

```powershell
npm.cmd run electron:preview
npm.cmd run electron:build
```

- `electron:preview` builds and opens the application in Electron.
- `electron:build` creates the portable Windows executable in `release`.

## Editing guidance

- Change restaurant details in `src/data/restaurant.json`.
- Change menu items and pizza options in `src/data/menu.json`.
- Change promotion codes in `src/data/promotions.json`.
- Change gallery captions and file paths in `src/data/gallery.json`.
- Add shared styling in `src/App.css`; global defaults live in `src/index.css`.
- Add a new screen in `src/pages`, then register its route in `src/App.jsx`.

Before sharing or merging a change, run both:

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Current prototype boundaries

- Checkout is a demonstration and does not collect payment.
- Orders are not stored or sent to a restaurant.
- Refreshing or closing the application clears the cart.
- `Database/schema.sql` is a design artifact and is not connected to React.
- Authentication and administrator features are not implemented in this
  Sprint 1 source.
