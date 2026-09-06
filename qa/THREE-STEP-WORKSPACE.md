# Campaign-first agent workspace

The workspace starts at a three-step mailing flow: target area and volume, a saved-address bilingual letter proof, then the exact server quote and payment. Recipient address review is collapsed on mobile. The final screen promises postal handoff within 72 elapsed hours after confirmation; stored deadlines now use that same interval, including weekends. Existing purchased licence credits remain available.

`/espace/page` renders the actual broker landing page without an initial address. Edit enables text editing in place, staged photo replacement and optional statistics, links and testimonials. Save uses the existing authenticated, CSRF-protected profile endpoint with version checks. Cancel does not save. Preview form submissions never send a lead.

Confirmed production letters persist a random recipient code inside each address record. Both languages use the corresponding recipient's URL and language. Reprints preserve codes using compare-and-swap; concurrent print requests agree. The public route loads only the matching address and coordinates. Cancelled, test and unpaid campaigns cannot serve recipient pages. Existing campaign-only QR links remain valid without an address.

Validation:

- `NODE_PATH=/home/liassetech/liasse.tech/node_modules node --test qa/three-step.test.cjs qa/mailing-onboarding.test.cjs qa/campaign-studio.test.cjs qa/broker-access.test.cjs`
- `NODE_PATH=/home/liassetech/liasse.tech/node_modules node qa/three-step-browser.cjs`
- Local browser tests use fixture geocoding/address responses, mock payment approval and a captured email transport. They do not contact customers or charge a card.
- Browser checks cover the three steps, itemized quote before payment, persisted address notes, distinct and stable recipient QR links, edited homeowner addresses, text/photo save and cancel, conflicts, FR/EN at 320/390/1440 px, and Letter duplex print geometry.
- A separate preview check against the real Google Maps API verified Street View for 4410 Pl. de la Meuse, Laval, both by geocoding and by stored coordinates, without production writes.

Release uses Liasse's existing tenant importer for VendVite (433), with a comparison against the saved generation 68 source. No schema migration or changes to other tenants are required.
