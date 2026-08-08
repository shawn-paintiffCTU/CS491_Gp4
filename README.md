# Plethora of PIES

Plethora of PIES is a React, Vite, and Supabase school-project demonstration
for a pickup-only pizza restaurant. Customers can browse the menu, customize
pizzas, manage a cart, apply active promotion codes, and place simulated
orders as either a guest or a signed-in customer.

This repository contains the functionality completed through **Sprint 2**.

> **Demonstration notice:** No real payment is processed. Do not enter real
> card or sensitive personal information.

## Sprint 2 functionality

Sprint 2 expanded the original menu and cart demonstration with accounts,
database-backed ordering, role-based administration, and account information.

### Customer accounts

- Customers can register and sign in through Supabase Authentication.
- New registrations automatically receive the `customer` role.
- Signed-in customers can save and update their name and phone number.
- Saved profile information automatically populates the checkout form.
- Customers can review their previous orders from **My Account**.
- Customers can remove their saved demonstration payment metadata.

### Guest checkout

- Customers may complete checkout without creating an account.
- Guest orders are stored for administrator review.
- Guest orders are not linked to an account and therefore do not appear in a
  personal order history.
- All orders use in-store pickup as the fulfillment method.

### Demonstration payment handling

- Checkout validates the cardholder name, demonstration card number,
  expiration date, and security code in the browser.
- Card numbers are limited to 16 digits.
- Expiration input automatically formats four digits as `MM/YY`.
- Full card numbers and security codes are never sent to Supabase or stored.
- Signed-in customers may save only:
  - cardholder name;
  - card brand;
  - last four digits; and
  - expiration month and year.
- A saved demonstration card can be selected during a later checkout.

### Administrator features

Administrator access is controlled by the `admin` role stored in Supabase.
The application includes three administrator areas:

- **Admin Orders:** Review registered-customer and guest orders, inspect order
  details, and update order status.
- **Admin Menu:** Mark menu items available or unavailable. Availability
  changes are reflected on the customer menu.
- **Admin Specials:** Create, edit, activate, deactivate, and remove specials.
  Active specials appear on the home page and their codes can be applied in
  the cart.

Admin pages are hidden from ordinary navigation and redirect unauthorized
users. Supabase Row Level Security also enforces authorization at the database
level, so access does not depend only on the React interface.

## Application pages

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Restaurant information, active specials, and photo gallery. |
| `/menu` | Menu | Available pizzas, sides, salads, and drinks. |
| `/menu/:itemId/customize` | Pizza Customizer | Pizza size, crust, toppings, quantity, and calculated price. |
| `/cart` | Cart | Quantities, removal, promotion codes, taxes, and totals. |
| `/checkout` | Checkout | Guest or account checkout with demonstration payment validation. |
| `/login` | Login | Existing-account authentication. |
| `/register` | Register | Customer-account creation. |
| `/account` | My Account | Profile, saved payment metadata, and order history. |
| `/admin/orders` | Admin Orders | Order review and status management. |
| `/admin/menu` | Admin Menu | Menu availability management. |
| `/admin/specials` | Admin Specials | Promotion and home-page special management. |

## Application architecture

The project separates display logic, shared state, data access, and pure
business logic so each part can be changed without rewriting the entire site.

| Location | Responsibility |
| --- | --- |
| `src/pages` | Complete routed screens and page-specific interaction logic. |
| `src/components` | Reusable interface components such as the layout, gallery, and floating notification. |
| `src/context` | Shared authentication, profile, saved-payment, and cart state. |
| `src/services` | Supabase queries and access to static menu/restaurant data. |
| `src/data` | Static restaurant, menu, and gallery content. |
| `src/utils` | Pure pricing and validation functions. |
| `src/hooks` | Reusable stateful behavior such as floating notifications. |
| `src/test` | Automated tests for validation logic. |
| `public` | Static images and browser assets. |
| `Database/schema.sql` | Supabase tables, functions, triggers, permissions, and policies. |

### Shared context

`AuthProvider.jsx` manages the active Supabase session, customer profile,
account role, and saved payment metadata. Pages use the `useAuth` hook rather
than duplicating authentication queries.

`CartProvider.jsx` manages cart items, quantities, promotion state, subtotal,
and discount values. Pages use the `useCart` hook so the menu, cart,
customizer, layout, and checkout all read the same cart state.

### Services

- `menuService.js` combines the static menu definition with availability data
  stored in Supabase.
- `promotionService.js` loads and validates promotions and provides
  administrator create, update, and delete operations.
- `orderService.js` creates orders through the `place_order` database function,
  loads account/admin order history, and updates order statuses.
- `restaurantService.js` loads static restaurant information.

### Utilities

- `pricing.js` contains currency formatting and order/pizza calculations.
- `contactValidation.js` applies the same name and phone validation to My
  Account and Checkout.
- `paymentValidation.js` validates demonstration payment input and returns only
  the safe metadata permitted to leave the checkout page.

## Database design

Supabase provides authentication and the PostgreSQL database.

| Table | Purpose |
| --- | --- |
| `profiles` | Customer name and phone information. |
| `user_roles` | Customer and administrator role assignments. |
| `saved_payment_methods` | Demonstration card metadata only; never full numbers or security codes. |
| `menu_item_availability` | Administrator-controlled menu availability. |
| `promotions` | Specials, promotion values, minimums, display order, and active status. |
| `orders` | Order totals, contact information, status, promotion, and safe payment metadata. |
| `order_items` | Individual items belonging to an order. |

The `place_order` database function creates an order and all of its items in a
single transaction. It associates authenticated orders with the current
Supabase user and leaves guest orders unassociated.

## Security model

- Passwords and sessions are handled by Supabase Authentication; application
  code never stores passwords.
- Every sensitive database table has Row Level Security enabled.
- Customers can read and update only their own profile and saved payment
  metadata.
- Customers can read only their own orders and order items.
- Only administrators may review all orders, change order status, modify menu
  availability, or manage promotions.
- New accounts cannot assign themselves the administrator role.
- The browser uses only the Supabase project URL and publishable key.
- A Supabase `service_role` or secret key must never be placed in this client
  application, Git, or Vercel client environment variables.
- React renders stored text normally and does not use raw HTML insertion.

This security model is appropriate for a school demonstration. A production
restaurant would additionally use a certified payment provider, server-owned
menu pricing, abuse prevention, expanded monitoring, and more comprehensive
automated tests.

## Initial setup

### Requirements

- Node.js Long-Term Support release
- npm
- A Supabase project

### Configure Supabase

1. Open the Supabase project.
2. Open the SQL Editor.
3. Run the complete contents of `Database/schema.sql`.
4. Confirm that the tables listed in the database-design section exist.
5. Assign administrator roles only through a trusted database-management
   process.

### Configure local environment variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Do not commit or submit `.env.local`. Configure the same variable names in
Vercel for hosted deployments.

### Install and run

```powershell
npm.cmd install
npm.cmd run dev
```

Vite displays the local address, normally `http://localhost:5173/`.

## Verification

Run all checks before opening or merging a pull request:

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

- `lint` checks JavaScript and React code-quality rules.
- `test` runs the Node.js automated tests.
- `build` verifies production imports and produces `dist`.

Current automated coverage includes valid and invalid contact information,
demonstration payment validation, safe card metadata, and expiration checks.

Important manual Sprint 2 checks:

1. Register, confirm, sign in, and sign out of a customer account.
2. Save profile information and confirm checkout pre-populates it.
3. Place both a guest order and a signed-in order.
4. Save and remove demonstration payment metadata.
5. Confirm account order history shows only the signed-in user's orders.
6. Confirm a customer cannot open administrator pages or modify protected data.
7. As an administrator, update order status and menu availability.
8. Create, edit, activate, deactivate, and remove a special.
9. Confirm active specials appear on the home page and their codes work in the
   cart.

## Deployment

Vercel hosts the browser application. The project must include these settings:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`

`vercel.json` redirects client-side routes to `index.html` so refreshing a
nested React route does not produce a 404 error.

Supabase database changes are deployed separately by running the maintained
schema or migration SQL against the intended Supabase project.

## Portable Windows build

Build the Electron demonstration with:

```powershell
npm.cmd run electron:build
```

The generated executable is placed in `release`. Electron opens the same Vite
production build and keeps Node.js integration disabled, context isolation
enabled, and renderer sandboxing enabled.

## Team workflow

1. Create a focused feature branch from the latest `main`.
2. Make and manually test the change.
3. Run lint, tests, and build.
4. Commit only source/configuration changes; omit `.env.local`, `node_modules`,
   `dist`, and `release`.
5. Push the branch and open a pull request.
6. Merge after the checks pass and the changed behavior is reviewed.

## Demonstration limitations

- No real payment is authorized or captured.
- Saved payment information cannot be used for a real transaction.
- Guest orders are intentionally not associated with customer accounts.
- Menu definitions and prices originate in static project data.
- The automated test suite covers validation utilities but does not yet provide
  full browser or database integration testing.
