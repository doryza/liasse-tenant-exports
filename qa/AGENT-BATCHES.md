# VendVite agent batches

Postal preparation only; declaring a campaign sent records a timestamp and never transmits mail. Numbered campaigns are ordered independently of the older tests. Declaration is idempotent and reversible; the detail screen advances to the earliest unsent numbered campaign.

The September 7 import uses courtier-outreach contact identities and verified postal address fields, with suppression, envelope-width and duplicate checks. All 500 recipients of the old test are already present in courtier-outreach. The original snapshot and QR records are retained as an archive with printing disabled.

Each new campaign has exactly 500 unique recipients. Québec campaigns print French then English, duplex. Other provinces print English, single-sided. Province and brand quotas reflect available eligible contacts. Office groups are spread across batches. Separate language groups are interleaved through the numbered sequence; incomplete final groups remain in reserve.

Non-Québec invitation provenance locks the landing page, signup response, activation email and account workspace to English, including subsequent login links and lead notifications. The source province persists in the broker profile; editing public profile fields does not replace it. Québec language selection remains available.

Validation: `node --test qa/agent-batches.test.cjs qa/mailing-onboarding.test.cjs qa/recipient-access.test.cjs`. Browser smoke test of mark-sent advancement runs only against the local preview. Production campaigns remain unsent.

Operational backup, import plan, reserve, exclusion audit and scoped transaction scripts are under the private `.liasse-ops/vendvite-agent-batches-20260907` directory on the operator machine. No contact data or credentials are committed to this repository. Apply the additive migration before importing this tenant export; the Liasse export importer does not run SQL migrations.
