# Liasse Restaurants — Ordering Integration (READ FIRST)

This app is linked to a **Liasse Restaurants** business so it can offer that
restaurant's **takeout & table ordering natively, in this app's own UI** —
without sending customers to the standalone /order page.

> **Liasse handles** pricing, tax, SMS phone verification, geofencing, operating
> hours, pickup timing, and owner notifications. **Do NOT re-implement them.**
> Your app only renders the menu, collects input, and calls the endpoints below.

## Linked restaurant

- **Name:** RedBox
- **Liasse business id:** 657
- **Base URL:** https://redboxpoulet.liasse.tech
  (the restaurant's own Liasse host — always call the RESTAURANT host, never this app's relative paths.)

## Endpoints

Ordering (resolved by the Base URL host):

| Method & path | Purpose |
|---|---|
| `GET  /order/menu.json` | Menu + tax + business meta. Each item has `available` — respect it. |
| `GET  /order/takeout-config` | Radius, hours status, min pickup, table-ordering/takeout flags, `ordersPaused`. |
| `POST /order/takeout-otp/send` | `{ phone }` → SMS code (60s cooldown). |
| `POST /order/takeout-otp/verify` | `{ phone, otp }` → `{ verificationToken }` (valid 30 min). |
| `POST /order/orders` | Place the order (body below) → `{ orderId, orderNumber }`. |
| `GET  /order/orders/:id` | Order details + live `status` (poll ~8s). |

Rating / Google-review funnel (host-agnostic — `placeId` is in the body):

| Method & path | Purpose |
|---|---|
| `POST /api/user-review` | `{ placeId, rating, comment, visitorId }`. |
| `POST /api/low-rating-feedback` | `{ placeId, rating, userEmail, message }` (private, for low scores). |

## Order body (`POST /order/orders`)

```json
{
  "customerName": "Jane",
  "orderType": "takeout",            // "dine_in" | "takeout"
  "tableNumber": null,               // REQUIRED for dine_in; null for takeout
  "items": [{ "menuItemId": "<item.id>", "name": "...", "quantity": 1, "unitPriceCents": 1299 }],
  "lat": 45.5, "lng": -73.5,         // REQUIRED — device geolocation (geofence)
  "phoneVerificationToken": "<jwt>", // from takeout-otp/verify — see the rule below
  "pickupOffsetMinutes": 30          // OR "pickupTime": "<ISO>" — OMIT for ASAP/at-counter
}
```

**Scheduled-takeout rule (read this — otherwise every takeout order 400s):** sending
`pickupOffsetMinutes` OR `pickupTime` on a takeout order makes it *scheduled*, and a
scheduled OR remote (beyond the geofence radius) takeout **always requires a valid**
`phoneVerificationToken` — there is no skippable OTP for those. For an ASAP order placed
at the counter, OMIT both pickup fields and the token. Do not send a raw `customerPhone`
as a substitute: the server records the verified phone from the token and a bare
`customerPhone` does not satisfy the requirement.

`unitPriceCents` is **display-only** — the server reprices every line from the
live menu, so a stale or tampered price cannot create a cheaper order.

## Worked flow (browse → checkout → post-order)

```js
const base = "https://redboxpoulet.liasse.tech";

// 1) Menu (server is authoritative on price/tax):
const menu = await (await fetch(base + "/order/menu.json")).json();
renderMenu(menu.menu.items.filter(i => i.available), menu.tax);

// 2) Geolocation is same-origin on YOUR site (no iframe):
navigator.geolocation.getCurrentPosition(async (pos) => {
  const body = {
    customerName, orderType, items,           // orderType: "dine_in" | "takeout"
    tableNumber,                              // required when dine_in; null for takeout
    lat: pos.coords.latitude, lng: pos.coords.longitude,
  };

  // 3) Scheduling a takeout pickup (or any takeout beyond the geofence radius)?
  //    Then it is "scheduled" and you MUST verify the phone first. For an ASAP
  //    order placed at the counter, skip this whole block (no pickup fields, no token).
  if (orderType === "takeout" && scheduledPickup) {
    await fetch(base + "/order/takeout-otp/send", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    const v = await (await fetch(base + "/order/takeout-otp/verify", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, otp }) })).json();
    body.phoneVerificationToken = v.verificationToken;
    body.pickupOffsetMinutes = 30;            // OR body.pickupTime = "<ISO>"
  }

  // 4) Place the order:
  const r = await fetch(base + "/order/orders", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const { orderId, orderNumber } = await r.json();

  // 5) Native confirmation + live status (response is snake_case — see fields below):
  const DONE = ["completed", "cancelled"];    // terminal states — stop polling
  const poll = async () => {
    const o = await (await fetch(base + "/order/orders/" + orderId)).json();
    renderStatus(o); // o.status: pending|confirmed|preparing|ready|completed|cancelled
    if (o.status === "ready" && menu.business.ratingEnabled && menu.business.placeId) {
      showRating(menu.business.placeId);
    }
    if (!DONE.includes(o.status)) setTimeout(poll, 8000);
  };
  poll();
});
```

`GET /order/orders/:id` returns **snake_case** fields — map these in your status UI:
`order_number`, `order_type`, `status`, `items`, `subtotal_cents`, `total_cents`,
`tax_breakdown`, `table_number`, `pickup_time`, `created_at`, `post_order_rating_enabled`.
(`status` can be any of pending|confirmed|preparing|ready|completed|cancelled.)

## Rating funnel (required — do not skip, or Google reviews are lost)

Gate it on **both** `menu.business.ratingEnabled` AND a truthy `menu.business.placeId`:
a restaurant can have ratings enabled while having no Google Place ID, in which case
`placeId` is null and both the review endpoints and the Google link will not work — so
show no prompt. When `status === "ready"` and both are present, show a star prompt:

- Submit every rating: `POST /api/user-review { placeId, rating, comment, visitorId }`.
- **5 stars** → link to `https://search.google.com/local/writereview?placeid=<placeId>`.
- **3–4 stars** → thank-you screen.
- **1–2 stars** → private form → `POST /api/low-rating-feedback { placeId, rating, userEmail, message }`.

`placeId` and `ratingEnabled` come from `GET /order/menu.json` (`business.placeId`, `business.ratingEnabled`).

## Rules & gotchas

- Always call the **restaurant Base URL** above — never this app's own relative paths.
- Serve this app over **HTTPS** (required for geolocation and CORS).
- `dine_in` requires `tableNumber`; takeout uses `pickupOffsetMinutes` or `pickupTime`.
- Check `ordersPaused` and `hoursStatus` from `/order/takeout-config` before showing the order button.
- Order management and live status also live in the **Liasse owner control center**.

_Generated by the Liasse AI Builder. Re-linking or re-exporting refreshes this file._
