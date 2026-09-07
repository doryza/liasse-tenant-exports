# VendVite Canadian postal campaign taxes

Current policy implemented September 7, 2026, after the owner authorized BC and cross-province treatment. The owner also explicitly requested operation without registration numbers. Numbers remain optional; none are invented. This release changes future postal campaign calculations. Existing order/invoice tax snapshots and annual subscriptions keep their recorded treatment.

## Product and place of supply

The paid product is a printed promotional letter for one realtor, with data, printing, folding, envelope, postage and postal handoff bundled into a single per-letter price. VendVite arranges mailing directly to the selected recipients. Treat that product as `printed_direct_mail`, with a single taxable delivered-letter price.

**Use each letter's delivery province for GST/HST, QST and PST/RST.** This replaces the earlier general-service business-billing-address assumption for postal campaigns. The customer's office, residence, licence or invoice address does not substitute for the delivery province. This is the implementation's classification of the current printed-and-mailed product based on the official guidance below, not a tax-authority ruling.

The purchaser still confirms a Canadian business billing address for the invoice. Existing profile details may prefill it, but are not silently accepted. Separate billing columns prevent profile changes from overwriting confirmed details.

## Rates and tax base

- GST 5% in non-HST provinces/territories.
- HST: Ontario 13%; Nova Scotia 14% (15% before April 1, 2025); New Brunswick, Newfoundland and Labrador, Prince Edward Island 15%.
- Quebec: GST plus QST 9.975%.
- BC: GST plus PST 7%; Manitoba: GST plus RST 7%; Saskatchewan: GST plus PST 6%.
- Alberta, Northwest Territories, Nunavut and Yukon: GST only.

BC's direct-mail rule covers promotional materials for a specific customer, including delivery/shipping, and distinguishes direct shipment outside BC. Manitoba's advertising and promotional-distribution guidance distinguishes in-province distribution from materials shipped out. Saskatchewan's bulletin taxes printed advertising and related production and exempts physical goods shipped outside the province by the vendor/common carrier. CRA and Revenu Québec use mailing destination for sales of shipped goods.

The entire delivered-letter price is used as the taxable base; postage is not presented as a separately supplied exempt item. A new product selling advertising space shared by several customers, digital-only design, separate services, or customer pickup/forwarding needs its own product rule. None of those products are automatically inferred from this postal campaign rule.

## Allocation, checkout and invoicing

`canadian-tax-v2.js` owns the default policy, destination validation and allocation. `VENDVITE_TAX_POLICY` may override a province's treatment; any explicit entry must include `treatment` (`taxable` or `not_applicable`) and a dated `review_reference`. Unspecified provinces retain their defaults. An incompatible explicit product classification or unknown provincial override stops checkout rather than silently exempting the transaction. The default configuration supports every Canadian province/territory and cross-province combination without a review gate.

Quotes require a `destinationCounts` object with canonical province codes, positive integer quantities and a sum exactly equal to the selected quantity. Missing or ambiguous counts produce an unresolved quote. The browser groups selected addresses and includes each province's count in its quote cache key. Old browser requests without counts must reload; they cannot accidentally use a billing-province tax fallback.

Checkout rebuilds the distribution from sanitized recipient coordinates, not client-provided tax or province claims. Invalid addresses/counts and an expected total different from the final calculation are rejected before PayPal creation. The existing Canada-wide boundary model provides province attribution.

The pre-tax subtotal after included campaign credits is allocated proportionally by letter count. Integer cents are assigned using largest remainder, with a province-code tie break. The result is independent of selection order and the allocations sum exactly to the paid subtotal. GST and each HST rate are aggregated across matching taxable bases and rounded once per tax/rate; provincial taxes remain distinct by jurisdiction. No province's tax is applied to another province's allocation.

Frozen snapshots contain the product/rule version, calculation date, billing address, delivery provinces, quantities, allocated net subtotals, discount-allocation method, tax bases, rates, provincial treatment references and optional registration numbers. The campaign keeps the actual recipient list. PayPal receives the same aggregate tax/total, and invoice/email/PDF lines use the saved snapshot. Capture validates order identity, amount and currency; retries are idempotent. Changes to addresses or policy do not reprice paid/pending PayPal orders. Pending orders must be cancelled before editing.

`invoice-v5.js` supports all eight possible tax lines without overlap. `invoice-email-v5.js` identifies BC PST, SK PST and MB RST separately. Legacy snapshots and invoices without snapshots remain readable through the retained legacy tax helpers. New annual subscriptions still use the existing Quebec-only plan restriction; this release is for postal campaigns.

## Records and operations

Retain the campaign's recipient list, saved allocation and actual mailing/shipping records to substantiate out-of-province delivery. A tax snapshot records the intended destination, not proof of completed delivery. If fulfillment destinations change, cancel/requote before payment or use the appropriate accounting correction after payment; do not overwrite recorded invoice taxes.

Registration numbers can be added later in invoice settings/server policy. Software configuration does not itself register the business, file returns or remit collected taxes. There is no registration-number entry requirement for a broker's order.

Deploy through the Liasse tenant importer, after comparing production generation and files to the captured baseline. No SQL migration is needed for this release: existing JSONB tax snapshots and GST/HST/QST/PST cent columns support allocations. Retain versioned modules to avoid stale runtime/browser code; do not deploy this export directory as a separate Railway service.

## Validation

- `node --test qa/destination-tax.test.cjs qa/canadian-tax.test.cjs qa/canada-map.test.cjs qa/campaign-invoice.test.cjs qa/invoice-settings.test.cjs`
- `node qa/canada-map-browser.cjs`
- `node qa/destination-tax-browser.cjs`

Tests cover all 169 billing/destination pairs, mixed campaigns, exact net-subtotal allocation, credits/rounding, malformed/missing counts, per-province overrides, false recipient province claims, stale/forged totals, PayPal amounts, snapshot preservation after policy/address changes, invoice/email tax lines, retries and legacy invoices. The mixed invoice PDF is rendered for visual inspection. Browser tests exercise real destination-count requests, national search/scans, saved recipient provinces, mobile layout and the removal of the city overlay.

## Official sources checked September 7, 2026

- [CRA GST/HST rates and place-of-supply rules: sale of mailed goods](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-place-supply.html)
- [Revenu Québec: sales of corporeal movable property](https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/basic-rules-for-applying-the-gsthst-and-qst/place-of-supply/sales-of-corporeal-movable-property/)
- [BC PST 125: advertising agencies, direct mailing](https://www2.gov.bc.ca/assets/gov/taxes/sales-taxes/publications/pst-125-advertising-agencies.pdf)
- [Manitoba 035: advertising materials and services](https://www.gov.mb.ca/finance/taxation/pubs/bulletins/035.pdf)
- [Manitoba 037: promotional distribution inside/outside Manitoba](https://www.gov.mb.ca/finance/taxation/pubs/bulletins/037.pdf)
- [Saskatchewan PST-67: advertising services](https://sets.saskatchewan.ca/rptp/wcm/connect/a14b1339-3418-4973-ac53-47147e0012b0/PST.067%2BAdvertising.pdf?MOD=AJPERES)

## National map

All 13 provinces/territories remain supported, with the Quebec city overlay removed. Canada-only search, province-aware initial framing, saved recipient provinces, CSV exports and letter formatting remain in place. Montreal property assessment enrichment remains local to Montreal.

Geometry is derived from Statistics Canada's [2021 province/territory digital boundaries](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/lpr_000a21a_e.zip), simplified by 20 metres and reprojected to WGS84 with five decimal places. Source: Statistics Canada, 2021 Census, adapted under the [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/reference/licence). This does not constitute Statistics Canada endorsement or a legal tax-boundary determination.
