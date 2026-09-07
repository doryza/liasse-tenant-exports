# VendVite mailing service and agent solicitation

Based on live tenant 433, generation 67. Existing licences retain their purchased access and annual letter credits. New signups use the server-owned `access_plan=mailing` column: $0 page, no subscription and no included postage. The existing $1.59/letter calculation and checkout taxes remain authoritative.

Admin → **Sollicitations VendVite** accepts up to 500 three-line agent blocks, separated by a blank line:

```text
Marie Tremblay {Agence Exemple, Courtier immobilier, 514 555-0100, https://example.com/marie.jpg}
1234 RUE DES ÉRABLES
LAVAL QC H7W 4Y4
```

Quote a metadata value containing a comma. Empty metadata values are allowed; a full agent name and both address lines are required. Duplicate blocks, malformed metadata, invalid portrait URLs and address lines too wide for the window are rejected before campaign creation. The full agent name is the first of three window lines, followed by both delivery address lines. Agency, title, phone and portrait metadata stay outside the window; portraits are omitted from the printed solicitation letter and remain available to the personalized demo. The parsed preview uses text nodes, and letter templates escape all imported text.

Campaigns and agents are inserted atomically. Each saved agent has a stable random `VV-…` tag, visible in the campaign and on the letter. Print one French page, one English page, or French/English duplex per agent. Print Letter at 100%; for duplex select long-edge flipping. Fold at 3 11/16 and 7 3/8 inches, leaving the addressed panel outside. The layout assumes the standard lower-left #10 window; test the actual stock before a batch.

Both QR languages open the tagged personalized demo. The server supplies `4410 Pl. de la Meuse, Laval, QC H7W 4Y4`; browser initialization geocodes it and calls the existing Street View loader. A Places fallback supports keys without Geocoding enabled. The demo never sends homeowner inquiries. The CTA opens a prefilled signup form, records mailing-only terms and sends the established single-use email link. The printed tag itself does not authenticate a broker.

Mailing-plan pages and lead submissions require a token associated with a paid, non-test, non-cancelled campaign. The production operator generates addressed homeowner letters from **Campagnes → Lettres adressées / PDF**, which creates/reuses that campaign token. Standalone slug URLs do not publish mailing-plan pages. Owners can preview and edit them before paying. Tokens identify paid campaigns but cannot prevent recipients from manually sharing links.

Validation: `node --test qa/mailing-onboarding.test.cjs qa/broker-access.test.cjs qa/campaign-studio.test.cjs` passes. `node qa/mailing-browser.cjs` checks the real import UI, two-page Letter output, fold/content geometry, production homeowner letters, both new signup surfaces, mobile overflow and real Google Street View rendering. External email and payment operations are stubbed in integration tests. Browser artifacts live in `/home/liassetech/previews/vendvite-mailing-service/`; their local test QR tags are not live campaign records.

Release: apply only `mailing-migration-v1.sql` to `tenant_vendvite` before importing this branch through the Liasse tenant importer. Verify the live source still matches the captured generation before either operation. The importer records a source restore point; rolling back code can leave the additive schema intact. No platform rebuild or paid subscription cancellation is needed.
