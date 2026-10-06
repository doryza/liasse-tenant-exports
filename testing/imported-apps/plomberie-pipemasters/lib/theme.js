'use strict';
/**
 * The site's design (business.json → design, picked by scripts/prospect_build/plumbing/design.js)
 * as CSS custom properties, the Google Fonts link and the logo mark.
 * The stylesheet only ever reads var(--…); a family adds structural rules through
 * html[data-family="…"] selectors in site.css.
 */
function vars(design) {
 const t = design.tokens, f = design.fonts;
 const out = Object.entries(t).map(([k, v]) => `--${k}:${v}`);
 const serif = /Serif|Fraunces|Newsreader|Gloock/.test(f.display);
 out.push(`--font-display:'${f.display}',${serif ? 'Georgia,serif' : 'system-ui,sans-serif'}`);
 out.push(`--font-text:'${f.text}',system-ui,-apple-system,'Segoe UI',sans-serif`);
 out.push(`--wf:${f.wf || 0.62}`, `--display-weight:${f.displayWeight}`, `--display-case:${f.displayCase}`, `--display-tracking:${f.displayTracking}`);
 out.push(`--r:${design.radius}`, `--r-lg:${design.radiusLg}`);
 return out.join(';');
}

const STOP = /^(plomberie|plombier|plombiers|plumbing|plumber|les|le|la|et|de|du|des|inc|enr|services?|&|-)$/i;
/** « Plomberie Pipemasters » → « P », « Plomberie J.-M. Tremblay » → « JT ». */
function initials(brand) {
 const words = String(brand || '').replace(/[.’'-]/g, ' ').split(/\s+/).filter(w => w && !STOP.test(w));
 const letters = words.map(w => w.charAt(0).toUpperCase()).filter(ch => /\p{L}|\d/u.test(ch));
 if (!letters.length) return String(brand || 'P').trim().charAt(0).toUpperCase() || 'P';
 return letters.length > 2 ? letters[0] + letters[letters.length - 1] : letters.join('');
}

const SHAPES = {
 nut: '<path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" class="mk-shape"/><circle cx="32" cy="32" r="21" class="mk-ring"/>',
 drop: '<path d="M32 3C24 16 9 28 9 41a23 23 0 0 0 46 0C55 28 40 16 32 3z" class="mk-shape"/>',
 square: '<rect x="4" y="4" width="56" height="56" rx="12" class="mk-shape"/>',
 circle: '<circle cx="32" cy="32" r="29" class="mk-shape"/>',
 elbow: '<rect x="4" y="4" width="56" height="56" rx="6" class="mk-shape"/><path d="M12 52V34a22 22 0 0 1 22-22h18" class="mk-pipe"/>',
};

/** Inline SVG mark; colours from CSS (mk-*). */
function mark(design, brand, { size = 44, label = '' } = {}) {
 const letters = initials(brand);
 const shape = SHAPES[design.mark] || SHAPES.square;
 const fs = letters.length > 1 ? 24 : 32;
 const y = design.mark === 'drop' ? 47 : 43;
 return `<svg class="mark mark-${design.mark}" width="${size}" height="${size}" viewBox="0 0 64 64" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${shape}<text x="32" y="${y}" text-anchor="middle" class="mk-letter" style="font-size:${fs}px">${letters}</text></svg>`;
}

module.exports = { vars, mark, initials, SHAPES };
