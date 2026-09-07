// Front façades checked in Google Street View in September 2026.
// Keep the property coordinates separate from the road camera location.
const demos = require('./province-demos-v1.json');
function demoFor(agent) {
  const known = require('./mailing-language-v1').province(agent);
  const postalProvince = String(agent && agent.address2 || '').toUpperCase().match(/\b(QC|ON|BC|AB|MB|SK|NS|NB|PE|NL|YT|NT|NU)\s+[A-Z]\d[A-Z]\s*\d[A-Z]\d\b/);
  const province = known || (postalProvince && postalProvince[1]);
  return Object.prototype.hasOwnProperty.call(demos, province) ? demos[province] : null;
}
module.exports = { demos, demoFor };
