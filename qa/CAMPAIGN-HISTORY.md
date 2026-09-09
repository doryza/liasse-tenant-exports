# Past-campaign address exclusions

The optional filter in the mailing studio supports all time, the previous 90 days, and a custom integer lookback of 1–36,500 days. Existing drafts default to off. The policy persists in the broker's draft and stays selected when starting a new search or campaign.

History is private to the signed-in broker. Only non-test confirmed/mailed campaigns count; paid campaigns must have a paid payment status, while included campaigns count upon confirmation. Cancelled and unpaid campaigns do not count. The targeting date is the recorded mailing date, falling back to campaign creation if not yet mailed. Day periods are rolling elapsed days, inclusive at the cutoff.

Matching uses the existing normalized civic number, street, municipality and unit, plus province. Accents, punctuation and supported street abbreviations normalize consistently. Different units/provinces remain distinct. This does not claim fuzzy matching of every possible street or municipality alias, and can only exclude campaigns recorded in VendVite.

Matched addresses remain visible in the map and the “Already targeted” list with their last targeting date. They are deselected without adding a manual exclusion. Search auto-selection, target fill, bulk selection, estimates, map/list controls and undo cannot re-add them while the filter applies. Reducing/disabling the filter makes addresses eligible again without silently restoring a mailing selection. Manual exclusions remain independent.

History requests have cancellation/stale-response protection and a 20-second deadline. Failed checks block additions, export and progression until retry succeeds or the filter is disabled. Draft saves recompute exclusions from the database and reconcile the current browser snapshot. Both included confirmation and paid order creation independently reject already-targeted addresses with a 409 response, allowing review before quantities/prices change. This is a user-selected targeting filter, not a permanent recipient opt-out list or a cross-broker exclusivity lock.

No migration is needed: preferences live in the existing draft JSON and history comes from existing campaign records. Publish through the scoped VendVite tenant importer after comparing live generation/files with the captured baseline.

Validation:
- `node --test qa/campaign-history.test.cjs`: normalization/unit identity, all-time/custom/boundary dates, latest date, status/test/broker scope, authenticated/CSRF-protected endpoint, policy validation, draft reconciliation, included and paid order guards. No emails or payments.
- `node qa/campaign-history-browser.cjs`: all periods, visible reasons, bulk/undo/estimate rules, custom validation, draft restore, failure/retry, stale responses, fresh searches, newer campaign reconciliation, French/English and mobile layout.
