# VendVite Canadian sales-tax strategy

Implemented against the live tenant 433 generation 98 export on September 7, 2026. Branch: `feat/vendvite-canadian-tax`. The owner authorized publication and explicitly requested operation without registration numbers. Registration numbers are optional; none are invented. Existing subscriptions are not repriced.

## Which address?

For a supply governed by the general GST/HST service rules, use the Canadian home/business address of the purchaser obtained in the ordinary course of business; where there are several, use the one most closely connected to the supply. VendVite now asks the purchaser to confirm the business address connected to the purchase. A sole proprietor may legitimately operate from home. A brokerage buying centrally may have a different purchasing address from an individual agent.

Existing profile information can prefill the form. A contact-list province, licence province, campaign location, language, IP address or PayPal payer address is not silently accepted as the purchaser's confirmed address. Billing details are stored in dedicated columns that profile edits cannot overwrite.

This is conditional on supply classification. Printed advertising sold and delivered as goods can follow delivery-based rules; separately supplied postage/transportation has special rules. Merely calling the bundle a service does not establish its tax treatment. A campaign advertising a realtor is not automatically a real-property service because the customer is a realtor.

## Implemented behavior

- Canadian address and postal/province validation; no automatic Quebec fallback.
- GST 5%; HST ON 13%, NS 14%, NB/NL/PE 15%; Quebec GST plus QST 9.975%. All 13 provinces/territories covered by the calculator. NS's pre-April 2025 rate is distinguished.
- Separate configured PST/RST treatment for BC (7%), MB (7%) and SK (6%). Those rates are NOT automatic proof of taxability. Unknown applicability blocks payment; it is not treated as exempt.
- Integer-cent calculation after included campaign credits. A quote with unresolved tax can be reviewed but cannot be paid.
- Frozen order snapshots contain the confirmed address, province, supply classification, rule version, date, tax rates, registration numbers and amounts. Invoices, email/PDF receipts and sales totals use those saved amounts. Historical invoices keep their original Quebec breakdown.
- PayPal receives the same tax and total. Returned order identity, CAD amount and completed capture amount are checked for new orders. Pending PayPal orders cannot have their tax snapshot overwritten; cancel them before changing the purchase. Retries do not create duplicate invoices.
- Existing legacy annual subscriptions are not repriced. New legacy subscriptions require a confirmed Quebec address; other provinces require a reviewed replacement plan. Do not market the old Quebec-priced subscription nationally.

## Operating policy and remaining configuration

The owner's approved operating strategy treats the managed advertising campaign as a general service and uses the purchaser's confirmed business address. The server defaults `campaign_classification` to `general_service`. This is an operating assumption, not a tax-authority ruling. Registration numbers may be supplied later in invoice settings (or existing `VENDVITE_GST_NUMBER` / `VENDVITE_QST_NUMBER`); they are not required to calculate tax or pay.

Use server-owned `VENDVITE_TAX_POLICY` JSON to configure reviewed provincial treatment. Example SHAPE, not an approved production policy:

```json
{
  "campaign_classification": "general_service",
  "pst": {
    "BC": {"treatment": "taxable", "registration": "ACTUAL NUMBER", "review_reference": "Dated applicability decision"},
    "MB": {"treatment": "not_applicable", "review_reference": "Dated grounds for not collecting"},
    "SK": {"treatment": "taxable", "registration": "ACTUAL NUMBER", "review_reference": "Dated applicability decision"}
  }
}
```

Do not copy this illustrative provincial mix into production. `not_applicable` needs a reason; lack of registration alone is not an exemption. Missing or unsupported provincial treatment blocks the affected paid campaigns, including sandbox. Cross-province campaigns targeting BC, MB or SK require allocation review even when the purchaser is in another province. The code does not support goods/delivery allocation, partial provincial taxable bases or multi-province use allocation; if those apply, implement that classification before enabling collection. Test fixtures use fictitious registrations only.

Confirm with the accountant/tax authority: whether the $1.59 printing/envelope/data/postage bundle is a single service, goods or multiple supplies; the provincial taxable base and any destination/use allocation; and provincial registration obligations. Software cannot register the business or remit taxes by itself.

Before release, compare current tenant generation/files with the captured baseline at `/home/liassetech/.liasse-ops/vendvite-tax-20260907/live-baseline.json`, reconcile any changes, apply the additive SQL migration to `tenant_vendvite` before using the tenant importer (the importer does not execute SQL), then test in sandbox. Existing orders with no snapshot retain their historical behavior. Retain recorded order and invoice snapshots for accounting; do not backfill historical tax from today's customer address.

The campaign map/data model now supports all 13 provinces/territories. The Quebec city overlay is removed. Search is restricted to Canada, initial framing uses the saved billing/profile province when available, and per-address provinces survive drafts, orders, CSV exports and letter formatting. Montreal property assessment enrichment remains Montreal-only; elsewhere the available OpenStreetMap address/property data is used.

## Validation

Run `node --test qa/canadian-tax.test.cjs qa/campaign-studio.test.cjs qa/campaign-invoice.test.cjs qa/invoice-settings.test.cjs` and `node qa/tax-browser.cjs`. Tests exercise all 13 jurisdictions, rounding/credits, missing address and review gates, postal mismatch, authenticated billing saves, PayPal amounts/mismatch rejection, immutable orders, changed customer addresses, invoice snapshots, replay handling and historical invoice/email behavior. The mobile form and generated Ontario PDF were rendered and visually inspected.

## Primary sources checked September 7, 2026

- [CRA general services place-of-supply rules](https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/3-3-6/plc-spply-prvnc-gnrl-rls-fr-srvcs.html)
- [CRA current GST/HST rates](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html)
- [Revenu Québec: sales of services](https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/basic-rules-for-applying-the-gsthst-and-qst/place-of-supply/sales-of-services/)
- [BC advertising agencies, PST 125](https://www2.gov.bc.ca/assets/gov/taxes/sales-taxes/publications/pst-125-advertising-agencies.pdf)
- [Manitoba printing and related services, bulletin 015](https://www.gov.mb.ca/finance/taxation/pubs/bulletins/015.pdf) and [advertising materials/services, bulletin 035](https://www.gov.mb.ca/finance/taxation/pubs/bulletins/035.pdf)
- [Saskatchewan advertising services, PST-67](https://sets.saskatchewan.ca/rptp/wcm/connect/a14b1339-3418-4973-ac53-47147e0012b0/PST.067%2BAdvertising.pdf?MOD=AJPERES)

## National map validation and data source

`node --test qa/canada-map.test.cjs` verifies all 13 provinces/territories, coastal and border Canadian cities, rejection of nearby US/Alaska/Greenland points, national draft persistence and number-free tax quotes. `node qa/canada-map-browser.cjs` checks desktop/mobile Vancouver, Toronto and Iqaluit searches/scans, Canada search restriction, CSV province retention, saved drafts, no overlay and no JavaScript errors. External geocoding/Overpass/tiles are mocked in browser tests.

Map coverage geometry is derived from Statistics Canada's [2021 province/territory digital boundaries](https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/lpr_000a21a_e.zip), simplified by 20 metres in the original projection and rounded to five decimal places after reprojection to WGS84. All 13 regions, holes and islands in the source are retained. This is geographic filtering, not a legal/tax-boundary determination. Source: Statistics Canada, 2021 Census, reproduced and adapted under the [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/reference/licence). This does not constitute Statistics Canada endorsement.
