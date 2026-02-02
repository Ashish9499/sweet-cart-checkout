# Design Decisions

This document captures key architectural and implementation decisions made while building the Atelier ecommerce store.

---

## Decision 1: Frontend-Only State Management with React Context

**Context:** The store needs to manage cart state, orders, discount codes, and provide "API-like" functions for checkout and admin operations—all without a backend.

**Options Considered:**
- **Option A:** Use Redux or Zustand for global state management
- **Option B:** Use React Context with useState hooks
- **Option C:** Use localStorage with custom hooks

**Choice:** React Context with useState hooks

**Why:** 
- No external dependencies required—keeps the bundle small
- The state shape is straightforward (cart, orders, discountCodes) without deeply nested updates that would benefit from Redux's reducers
- Context provides a clean "provider" pattern that mirrors how a real API client would be injected
- For an in-memory demo, localStorage persistence wasn't needed (though it could be added later)
- Trade-off: Context re-renders all consumers on any state change, but with this app's scale, it's negligible

---

## Decision 2: Discount Code Generation on Checkout (Not Admin-Triggered)

**Context:** The spec says "every nth order gets a coupon code." The question was: when exactly should the code be generated?

**Options Considered:**
- **Option A:** Generate the code automatically when the qualifying order is placed
- **Option B:** Require an admin to manually trigger code generation after conditions are met
- **Option C:** Pre-generate codes and assign them to qualifying orders

**Choice:** Option A—automatic generation at checkout time, with Option B available as a secondary admin feature

**Why:**
- Automatic generation ensures customers immediately see their reward on the success page—better UX
- The admin "Generate Code" button serves as a fallback/manual override, but is gated by the same nth-order logic to prevent abuse
- Pre-generating codes would require predicting order volume and managing unused codes
- Trade-off: The customer always gets their code; there's no "claim" step, which could be a feature in a more complex loyalty system

---

## Decision 3: Discount Codes as Single-Use with Immutable Percentage

**Context:** How should discount codes behave? Can they be reused? Can the discount percentage change?

**Options Considered:**
- **Option A:** Single-use codes with fixed percentage
- **Option B:** Multi-use codes with usage limits
- **Option C:** Configurable codes where admins can edit percentage/expiry

**Choice:** Single-use codes with fixed percentage (Option A)

**Why:**
- Simplest model that matches the spec ("every nth order gets a coupon")
- Prevents fraud—once a code is used, it's marked `used: true` and rejected on future attempts
- The percentage is set by `StoreConfig.discountPercentage` at generation time, ensuring consistency
- Trade-off: No code sharing between users, no expiry dates. These could be added by extending the `DiscountCode` type with `expiresAt` and `maxUses` fields

---

## Decision 4: Order ID as Sequential Integer (Not UUID)

**Context:** Orders need unique identifiers. The nth-order discount logic depends on knowing how many orders have been placed.

**Options Considered:**
- **Option A:** Use `orders.length + 1` as the order ID (sequential integer)
- **Option B:** Use `crypto.randomUUID()` for globally unique IDs
- **Option C:** Use timestamps as IDs

**Choice:** Sequential integer (Option A)

**Why:**
- The discount logic (`orderId % nthOrderForDiscount === 0`) requires a predictable, sequential number
- For an in-memory demo, collisions aren't a concern
- Sequential IDs are human-readable ("Order #3") which improves admin UX
- Trade-off: In a real distributed system, UUIDs would be necessary to prevent race conditions. The sequential logic would need to query a database count instead

---

## Decision 5: Warm Terracotta Design System (Not Generic Blue/Purple)

**Context:** The store needed a visual identity. Most AI-generated UIs default to blue/purple gradients on white.

**Options Considered:**
- **Option A:** Standard blue primary with white background (safe, corporate)
- **Option B:** Bold terracotta/cream palette with gold accents (warm, artisanal)
- **Option C:** Dark mode first with neon accents (modern, techy)

**Choice:** Warm terracotta palette with cream backgrounds and gold accent for rewards

**Why:**
- Differentiates from generic AI aesthetics—feels like a curated boutique
- Terracotta (`hsl(15, 65%, 50%)`) is warm and inviting, appropriate for a store called "Atelier"
- Gold accent (`hsl(42, 80%, 55%)`) creates visual hierarchy for discount/reward elements
- Cream background (`hsl(40, 33%, 97%)`) is easier on the eyes than pure white
- Trade-off: Less "corporate" feel, which is intentional for this demo but might not suit B2B applications

---

## Decision 6: Cart Stored as `CartItem[]` with Embedded Product

**Context:** How should cart items reference products? By ID (normalized) or by embedding the full product object (denormalized)?

**Options Considered:**
- **Option A:** Store `{ productId: string, quantity: number }` and look up products when needed
- **Option B:** Store `{ product: Product, quantity: number }` with the full product embedded

**Choice:** Embedded product (Option B)

**Why:**
- Simplifies rendering—no need to join cart items with a products lookup
- Captures the product state at time of adding (if prices changed, the cart would show the original price—though this demo has static prices)
- Reduces derived state calculations throughout the app
- Trade-off: Slightly larger memory footprint, and if product data could change (e.g., images), the cart would show stale data. In a real app with a backend, normalized IDs with server-side resolution would be better

---

## Decision 7: Config as Hardcoded Constants (Not Admin-Editable)

**Context:** The "nth order" and "discount percentage" values need to be defined somewhere. Should admins be able to change them?

**Options Considered:**
- **Option A:** Hardcode in StoreContext as a constant
- **Option B:** Make them part of state that admins can edit
- **Option C:** Store in a separate config file or environment variables

**Choice:** Hardcoded in state with `StoreConfig` type (Option A with typed structure)

**Why:**
- Meets the spec without over-engineering—the values are defined once and used consistently
- The `StoreConfig` type (`{ nthOrderForDiscount: 3, discountPercentage: 10 }`) documents the business rules clearly
- Adding admin editability would require additional UI, validation, and state persistence
- Trade-off: Changing these values requires code changes. For a production app, these should be stored in a database or environment config

---

## Summary

| Decision | Trade-off Accepted |
|----------|-------------------|
| React Context | Re-renders all consumers (acceptable at this scale) |
| Auto-generate codes | No manual claim step |
| Single-use codes | No sharing or multi-use |
| Sequential order IDs | Not suitable for distributed systems |
| Terracotta palette | Less corporate aesthetic |
| Embedded products in cart | Stale data if products change |
| Hardcoded config | Requires code change to modify |

These decisions prioritize **simplicity, clarity, and demo-ability** over production-grade scalability. Each could be revisited if the app grows in scope.
