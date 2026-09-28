/**
 * vCard 3.0 — the format every phone imports (iOS Contacts, Android, Outlook).
 * Values are escaped per RFC 2426 and lines folded at 75 octets.
 */
const S = require('./settings');

function esc(value) {
  return String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/** Fold to 75 octets, never splitting a UTF-8 sequence. */
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    out.push(bytes.slice(start, end).toString('utf8'));
    start = end;
    limit = 74; // continuation lines start with one space
  }
  return out.join('\r\n ');
}

const SOCIAL = { linkedin: 'linkedin', instagram: 'instagram', facebook: 'facebook', x: 'twitter', tiktok: 'tiktok', youtube: 'youtube', github: 'github' };

/** @param {object} card settings, links, lang, pageUrl, photo {type, base64}|null */
function build({ settings, links, lang, pageUrl, photo }) {
  const name = String(settings.full_name || '').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const family = parts.length > 1 ? parts[parts.length - 1] : '';
  const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] || '');
  const title = lang === 'en' ? (settings.title_en || settings.title_fr) : (settings.title_fr || settings.title_en);
  const location = lang === 'en' ? (settings.location_en || settings.location_fr) : (settings.location_fr || settings.location_en);
  const bio = lang === 'en' ? (settings.bio_en || settings.bio_fr) : (settings.bio_fr || settings.bio_en);
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${esc(family)};${esc(given)};;;`, `FN:${esc(name || '—')}`];
  if (settings.organization) lines.push(`ORG:${esc(settings.organization)}`);
  if (title) lines.push(`TITLE:${esc(title)}`);
  if (settings.phone) lines.push(`TEL;TYPE=CELL,VOICE:${esc(settings.phone)}`);
  if (settings.email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${esc(settings.email)}`);
  if (settings.website) lines.push(`URL;TYPE=WORK:${esc(settings.website)}`);
  if (pageUrl) lines.push(`URL:${esc(pageUrl)}`);
  if (location) lines.push(`ADR;TYPE=WORK:;;;${esc(location)};;;`);
  for (const link of links || []) {
    if (SOCIAL[link.kind]) lines.push(`X-SOCIALPROFILE;TYPE=${SOCIAL[link.kind]}:${esc(link.url)}`);
    else lines.push(`URL:${esc(link.url)}`);
  }
  if (bio) lines.push(`NOTE:${esc(bio)}`);
  if (photo && photo.base64) lines.push(`PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.base64}`);
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`, 'END:VCARD');
  return lines.map(fold).join('\r\n') + '\r\n';
}

function filename(settings) {
  const base = String(settings.full_name || 'contact').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'contact';
  return `${base}.vcf`;
}

module.exports = { build, filename, fold, esc, initials: S.initials };
