Richard Tremblay now renders through the same renderBrokerPage function and views/broker-page.ejs template used by paying brokers, with the same CSS, address lookup, property dossier, lead form, agent section and footer. The separate demo layout and script have been removed. A small demo banner links back to the $599/year offer. Profile identity, portrait, affiliation and statistics are illustrative.

window.VV_DEMO prevents lead submissions in the shared client script; the reserved demo API endpoint also returns an inert response. Real broker requests keep their existing behavior. The shared header also fits 320px screens.

Validation: node --test qa/demo-template.test.cjs proves that both demo and active customer routes render broker-page, demo POSTs create no leads or emails, and a real broker POST creates its lead. qa/demo-browser.cjs checks FR/EN at 320/390/1440px, homepage pricing, navigation, portrait, form completion and overflow. PREVIEW_BASE selects local or live testing.

This correction uses live generation 59 as its exact pre-import baseline. Publishing was explicitly authorized in the conversation. The scoped importer creates a restore point before updating tenant 433.
