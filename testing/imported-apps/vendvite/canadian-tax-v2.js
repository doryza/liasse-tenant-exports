'use strict';
const legacy = require('./canadian-tax-v1');
const VERSION = 'ca-direct-mail-2026-09-07';
const provincialRates = {BC:7, MB:7, SK:6};
function failure(code) { const e = Error(code); e.code = code; throw e; }
function policy(value) {
  const configured = legacy.object(value);
  return Object.assign({campaign_classification:'printed_direct_mail'}, configured, {
    pst: Object.assign({
      BC:{treatment:'taxable',review_reference:'PST 125 direct mailing; owner authorization 2026-09-07'},
      MB:{treatment:'taxable',review_reference:'MB 035/037 printed promotional mail; owner authorization 2026-09-07'},
      SK:{treatment:'taxable',review_reference:'PST 67 printed advertising; owner authorization 2026-09-07'}
    }, legacy.object(configured.pst))
  });
}
// Quotes must identify the quantity in every destination province. Actual orders
// rebuild this distribution from sanitized mailing addresses, never from totals.
function destinationCounts(value, quantity) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) failure('DESTINATION_COUNTS_REQUIRED');
  const keys = Object.keys(value).sort(), counts = {};
  if (!keys.length || keys.length > 13) failure('DESTINATION_COUNTS_REQUIRED');
  let total = 0;
  keys.forEach(p => {
    if (!legacy.provinces[p] || !Number.isSafeInteger(value[p]) || value[p] < 1) failure('BAD_DESTINATION_COUNTS');
    counts[p] = value[p]; total += value[p];
  });
  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(total) || total !== quantity) failure('DESTINATION_COUNT_MISMATCH');
  return counts;
}
function countsFromAddresses(addresses) {
  const counts = {};
  addresses.forEach(a => {
    if (!legacy.provinces[a.province]) failure('BAD_DESTINATION_COUNTS');
    counts[a.province] = (counts[a.province] || 0) + 1;
  });
  return counts;
}
function calculateMailing(subtotal, billingAddress, counts, quantity, p, now) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0 || subtotal > 100000000) failure('BAD_SUBTOTAL');
  const address = legacy.validate(billingAddress);
  counts = destinationCounts(counts, quantity); p = legacy.object(p);
  if (p.campaign_classification !== 'printed_direct_mail') failure('TAX_CLASSIFICATION_REVIEW');
  const date = (now || new Date()).toISOString().slice(0,10);
  // Allocate any included-credit discount uniformly by letter count. Largest
  // remainder with province-code tie break keeps the sum exact and order neutral.
  const allocations = Object.keys(counts).map(province => {
    const weighted = subtotal * counts[province];
    if (!Number.isSafeInteger(weighted)) failure('BAD_SUBTOTAL');
    return {province,quantity:counts[province],subtotal_cents:Math.floor(weighted / quantity),remainder:weighted % quantity};
  });
  let residual = subtotal - allocations.reduce((n,a) => n+a.subtotal_cents,0);
  allocations.slice().sort((a,b) => b.remainder-a.remainder || a.province.localeCompare(b.province)).forEach(a => {if(residual > 0) {a.subtotal_cents++; residual--;}});
  const groups = new Map();
  function add(code, rate, allocation, registration, jurisdiction, reference) {
    const key = [code,rate,jurisdiction || 'CA'].join(':');
    if (!groups.has(key)) groups.set(key,{code,rate,province:jurisdiction || null,provinces:[],taxable_cents:0,amount_cents:0,registration:registration || '',review_reference:reference || ''});
    const line = groups.get(key); line.taxable_cents += allocation.subtotal_cents; line.provinces.push(allocation.province);
  }
  allocations.forEach(a => {
    delete a.remainder;
    const province = a.province;
    const hst = {ON:13,NS:date<'2025-04-01'?15:14,NB:15,NL:15,PE:15}[province];
    add(hst?'HST':'GST',hst || 5,a,p.gst_number);
    if (province === 'QC') add('QST',9.975,a,p.qst_number,'QC');
    if (provincialRates[province]) {
      const rule = p.pst && p.pst[province];
      if (!rule || !rule.review_reference || !['taxable','not_applicable'].includes(rule.treatment)) failure('PROVINCIAL_TAX_REVIEW');
      a.provincial_treatment = rule.treatment; a.review_reference = rule.review_reference;
      if (rule.treatment === 'taxable') add(province==='MB'?'RST':'PST',provincialRates[province],a,rule.registration,province,rule.review_reference);
    }
  });
  const order = {GST:0,HST:1,QST:2,PST:3,RST:4};
  const lines = [...groups.values()].sort((a,b) => order[a.code]-order[b.code] || a.rate-b.rate || String(a.province).localeCompare(String(b.province)));
  lines.forEach(l => {l.provinces.sort();l.amount_cents = Math.round(l.taxable_cents * Math.round(l.rate*1000) / 100000);});
  return {version:VERSION,date,classification:'printed_direct_mail',basis:'supplier_mailed_destination',billing_address:address,billing_province:address.province,province:allocations.length===1?allocations[0].province:null,destination_provinces:allocations.map(a=>a.province),quantity,allocation_method:'proportional_net_subtotal_largest_remainder',allocations,lines,subtotal_cents:subtotal,total_cents:subtotal+lines.reduce((n,l)=>n+l.amount_cents,0)};
}
function label(line) {
  return legacy.label(line) + (line.province && ['PST','RST'].includes(line.code) ? ' · '+line.province : '');
}
module.exports = Object.assign({},legacy,{policy,destinationCounts,countsFromAddresses,calculateMailing,label});
