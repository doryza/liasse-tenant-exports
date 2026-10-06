'use strict';
/**
 * The home cutaway: a section drawing of a Québec house and its plumbing, from the city
 * mains under the street to the fixtures upstairs. Cold supply (blue), hot supply (red),
 * drains (grey), the water entry and main valve, the water heater, the sump pit, the
 * floor drain, the backwater valve and the outdoor faucet.
 *
 * render({ house, mirror, spots, title, zone }) → SVG markup (zone = a detail crop). Colours come from CSS
 * custom properties (theme.js), so one drawing serves every palette. `spots` is
 * [{ zone, n, href, label }]: numbered markers for the site's own service pages (clicked via
 * site.js; the accessible links are the legend next to the drawing).
 * Markers are drawn outside the mirrored group so their numerals never flip.
 *
 * No real building, no people, no text inside the art.
 */
const W = 1000, H = 720;
const G = 470;          // ground line
const BF = 620;         // basement floor
const X0 = 110, X1 = 740;  // outside faces of the walls
const WALL = 14;

const HOUSES = {
 bungalow: { floors: [[330, G]], roof: 'gable', apex: 215 },
 cottage: { floors: [[330, G], [190, 330]], roof: 'gable', apex: 82 },
 plex: { floors: [[360, G], [250, 360], [140, 250]], roof: 'flat', apex: 140 },
};

// Stones in the soil: a fixed scatter (no pattern fills — url(#id) breaks under <base href>).
const STONES = (() => {
 let seed = 7, out = '';
 const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 for (let k = 0; k < 150; k++) {
  const x = rnd() * 1000, y = 478 + rnd() * 240, rad = 0.9 + rnd() * 1.8;
  if (x > 104 && x < 746 && y < 650) continue; // not inside the basement
  out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(1)}" class="cw-stone"/>`;
 }
 return out;
})();
const r = (x, y, w, h, cls, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"${extra}/>`;
const p = (d, cls, extra = '') => `<path d="${d}" class="${cls}"${extra}/>`;
const c = (x, y, rad, cls) => `<circle cx="${x}" cy="${y}" r="${rad}" class="${cls}"/>`;

/** Fixtures for one floor. `bath` / `kitchen` say which rooms this floor has. */
function floorFixtures(top, bottom, { bath, kitchen }) {
 const out = [], hot = [], cold = [], drain = [];
 const fl = bottom - WALL / 2; // finished floor level of this storey
 if (bath) {
  // bathtub, toilet, lavatory; drain into the main stack at x = 300
  out.push(p(`M136 ${fl - 34}h112v26a8 8 0 0 1-8 8h-96a8 8 0 0 1-8-8z`, 'cw-fix'));
  out.push(p(`M146 ${fl - 34}v-6h92v6`, 'cw-fix-line'));
  out.push(p(`M262 ${fl}v-28h30v28z M258 ${fl - 28}h38a4 4 0 0 0 0-8h-38z M262 ${fl - 60}h20v24h-20z`, 'cw-fix'));
  out.push(p(`M318 ${fl - 52}h46l-6 14h-34z M334 ${fl - 38}v38`, 'cw-fix'));
  out.push(r(337, fl - 66, 4, 12, 'cw-tap'));
  drain.push(`M196 ${fl}v10H300`, `M277 ${fl}v10`, `M341 ${fl - 30}v8h-41`);
  cold.push(`M372 ${bottom + 12}V${fl - 58}h-28`);
  hot.push(`M384 ${bottom + 18}V${fl - 62}h-40`);
  out.push(r(420, top + 6, 8, bottom - top - 60, 'cw-part'));
 }
 if (kitchen) {
  // counter with sink, upper cabinet; drain into the kitchen stack at x = 688
  out.push(r(548, fl - 50, 156, 50, 'cw-fix'));
  out.push(p(`M590 ${fl - 50}h56v14h-56z`, 'cw-basin'));
  out.push(r(560, fl - 94, 128, 22, 'cw-fix'));
  out.push(p(`M618 ${fl - 50}v-16h16`, 'cw-tap-line'));
  drain.push(`M618 ${fl - 36}v18h70`);
  cold.push(`M604 ${bottom + 12}V${fl - 26}h10`);
  hot.push(`M630 ${bottom + 18}V${fl - 26}h-8`);
 }
 return { out, hot, cold, drain };
}

function house(kind) {
 const h = HOUSES[kind] || HOUSES.cottage;
 const parts = [], hot = [], cold = [], drain = [];
 const top = h.floors[h.floors.length - 1][0];
 // rooms (interior fill), then walls and floor slabs as solid cut sections
 parts.push(r(X0, top, X1 - X0, G - top, 'cw-room'));
 parts.push(r(X0, G, X1 - X0, BF - G + WALL, 'cw-cellar'));
 if (h.roof === 'gable') {
  parts.push(p(`M${X0 - 34} ${top + 6}L${(X0 + X1) / 2} ${h.apex}L${X1 + 34} ${top + 6}`, 'cw-roof'));
  parts.push(p(`M${X0 - 4} ${top}L${(X0 + X1) / 2} ${h.apex + 26}L${X1 + 4} ${top}z`, 'cw-attic'));
 } else {
  // plex: flat roof, cornice and parapet
  parts.push(r(X0 - 8, top - 18, X1 - X0 + 16, 18, 'cw-wall'));
  parts.push(r(X0 - 18, top - 30, X1 - X0 + 36, 12, 'cw-cornice'));
  for (let x = X0 + 10; x < X1 - 10; x += 34) parts.push(r(x, top - 18, 14, 10, 'cw-dent'));
 }
 parts.push(r(X0, top, WALL, BF - top + WALL, 'cw-wall'));
 parts.push(r(X1 - WALL, top, WALL, BF - top + WALL, 'cw-wall'));
 // footing
 parts.push(r(X0 - 14, BF + WALL, 40, 14, 'cw-wall'));
 parts.push(r(X1 - 26, BF + WALL, 40, 14, 'cw-wall'));
 // slabs: every floor, the ground floor deck and the basement slab
 for (const [, bottom] of h.floors) parts.push(r(X0, bottom - WALL / 2, X1 - X0, WALL, 'cw-slab'));
 parts.push(r(X0, BF, X1 - X0, WALL, 'cw-slab'));
 // windows cut through both walls on every floor
 h.floors.forEach(([t, b]) => {
  const wy = t + (b - t) * 0.28, wh = (b - t) * 0.36;
  parts.push(r(X1 - WALL, wy, WALL, wh, 'cw-glass'));
  parts.push(r(X0, wy, WALL, wh, 'cw-glass'));
 });
 // basement window well on the street side
 parts.push(r(X1 - WALL, G + 14, WALL, 30, 'cw-glass'));
 // fixtures: plex = bath + kitchen per floor; cottage = kitchen down, bath up; bungalow = both
 h.floors.forEach(([t, b], i) => {
  const rooms = kind === 'plex' || kind === 'bungalow' ? { bath: true, kitchen: true }
   : i === 0 ? { bath: false, kitchen: true } : { bath: true, kitchen: false };
  const f = floorFixtures(t, b, rooms);
  parts.push(...f.out); hot.push(...f.hot); cold.push(...f.cold); drain.push(...f.drain);
 });
 // stacks: main stack (bath) x = 300 and kitchen stack x = 688, vents through the roof
 const bathFloors = h.floors.filter((_, i) => kind !== 'cottage' || i > 0);
 const stackTop = (kind === 'plex' ? top - 40 : h.apex + (kind === 'bungalow' ? 70 : 90));
 if (bathFloors.length) drain.push(`M300 ${stackTop}V${BF + 34}`);
 drain.push(`M688 ${kind === 'plex' ? top - 40 : stackTop + 30}V${BF + 34}`);
 // exterior stairs + balconies on a plex (street side), the Montréal signature
 if (kind === 'plex') {
  h.floors.slice(1).forEach(([, b]) => { parts.push(r(X1, b - 10, 58, 8, 'cw-balcony')); parts.push(p(`M${X1 + 58} ${b - 10}v-34`, 'cw-rail')); });
  parts.push(p(`M${X1 + 4} ${G}L${X1 + 58} ${h.floors[1][1] - 6} M${X1 + 18} ${G}L${X1 + 72} ${h.floors[1][1] - 6}`, 'cw-rail'));
  for (let k = 1; k < 9; k++) { const t = k / 9; parts.push(p(`M${X1 + 4 + 54 * t} ${G - (G - h.floors[1][1] + 6) * t}h14`, 'cw-rail')); }
 }
 return { parts, hot, cold, drain, top, kind };
}

// Detail crops (unmirrored coordinates, 3:2) — a service card shows its part of the house.
function crops(kind) {
 const h = HOUSES[kind] || HOUSES.cottage;
 const fl0 = h.floors[0][1], flTop = h.floors[h.floors.length - 1][1];
 const leakY = kind === 'bungalow' ? G + 22 : kind === 'plex' ? 374 : 344;
 return {
  leak: [224, leakY - 96, 240, 160], bath: [118, flTop - 112, 288, 192], kitchen: [520, fl0 - 128, 216, 144],
  heater: [400, 470, 240, 160], main: [620, 500, 210, 140], street: [740, 500, 260, 173], sewer: [700, 536, 300, 200],
  backflow: [548, 566, 186, 124], sump: [96, 560, 186, 124], floordrain: [196, 540, 210, 140], outdoor: [666, 370, 186, 124],
  house: [0, 40, 1000, 667],
 };
}

function render({ house: kind = 'cottage', mirror = false, spots = [], title = '', zone = null } = {}) {
 const hs = house(kind);
 const hot = [...hs.hot], cold = [...hs.cold], drain = [...hs.drain];
 const art = [];

 // ground: soil with stones, grass line, street with sidewalk
 art.push(r(0, G, W, H - G, 'cw-soil'));
 art.push(STONES);
 art.push(r(0, G - 6, X0 - 14, 6, 'cw-grass'));
 art.push(r(X1 + 14, G - 6, 60, 6, 'cw-grass'));
 art.push(r(X1 + 74, G - 4, 50, 8, 'cw-curb'));
 art.push(r(X1 + 124, G - 2, W - X1 - 124, 16, 'cw-road'));
 // a shrub and a tree on the yard side give scale without people
 art.push(p(`M44 ${G - 6}c-18-4-22-34 0-40c4-22 34-22 40-2c20 4 18 40-4 42z`, 'cw-shrub'));
 art.push(r(70, G - 200, 8, 196, 'cw-trunk'));
 art.push(c(74, G - 228, 46, 'cw-shrub'));
 art.push(c(46, G - 196, 30, 'cw-shrub'));

 art.push(...hs.parts);

 // ---- basement equipment --------------------------------------------------------
 // water entry: water main (street) → curb valve → through the wall → meter + main valve
 art.push(c(902, 590, 18, 'cw-main'));
 art.push(p(`M832 ${G + 14}v86`, 'cw-curbstop'));
 art.push(r(824, G + 6, 16, 10, 'cw-curbcap'));
 cold.push(`M884 590H${X1 - WALL}`, `M${X1 - WALL} 590H712V${G + 18}`);
 art.push(r(696, 548, 32, 22, 'cw-meter'));
 art.push(c(712, 559, 6, 'cw-gauge'));
 art.push(p(`M705 584h14 M712 584v-8`, 'cw-valve-stem'));
 art.push(r(700, 578, 24, 12, 'cw-valve'));
 // cold trunk under the ground floor
 cold.push(`M712 ${G + 18}H372V${G - 6}`, `M604 ${G + 18}V${G - 6}`, `M496 ${G + 18}V516`);
 // water heater with its hot trunk
 art.push(p(`M466 530a30 12 0 0 1 60 0v82a6 6 0 0 1-6 6h-48a6 6 0 0 1-6-6z`, 'cw-heater'));
 art.push(p(`M466 530a30 12 0 0 0 60 0`, 'cw-heater-line'));
 art.push(r(486, 566, 20, 26, 'cw-heater-panel'));
 art.push(c(496, 576, 4, 'cw-gauge'));
 hot.push(`M512 520V${G + 26}H384V${G - 6}`, `M512 ${G + 26}H630V${G - 6}`);
 // water sensor beside the heater
 art.push(p(`M540 ${BF - 1}a9 5 0 0 1 18 0z`, 'cw-sensor'));
 // sump pit and pump, discharge up and out
 art.push(p(`M150 ${BF}v60h66v-60`, 'cw-pit'));
 art.push(p(`M156 ${BF + 30}h54v30h-54z`, 'cw-water'));
 art.push(r(170, BF + 26, 26, 30, 'cw-pump'));
 drain.push(`M183 ${BF + 26}V${G + 30}H${X0}`);
 art.push(p(`M${X0 - 2} ${G + 30}h-30`, 'cw-discharge'));
 // floor drain + building drain under the slab → backwater valve → lateral to the sewer main
 art.push(r(288, BF - 3, 24, 5, 'cw-grate'));
 drain.push(`M300 ${BF + 2}v32`, `M230 ${BF + 34}H${X1 - WALL}`, `M${X1 - WALL} ${BF + 34}L938 ${BF + 58}`);
 art.push(r(626, BF + 22, 34, 24, 'cw-backflow'));
 art.push(p(`M636 ${BF + 26}l14 8-14 8z`, 'cw-flap'));
 art.push(r(632, BF - 4, 22, 6, 'cw-grate'));
 art.push(c(948, BF + 62, 30, 'cw-sewer'));
 art.push(c(948, BF + 62, 18, 'cw-sewer-in'));
 // outdoor faucet on the street side of the ground floor
 cold.push(`M712 ${G + 18}V444H${X1 + 2}`);
 art.push(p(`M${X1} 438h14v14h-6v8`, 'cw-sillcock'));
 // the leak: a drip under the top bathroom, onto the floor below
 const leakY = kind === 'bungalow' ? G + 22 : hs.kind === 'plex' ? 360 + 14 : 330 + 14;

 const pipes = [
  ...drain.map(d => p(d, 'cw-drain')),
  ...cold.map(d => p(d, 'cw-cold', ' pathLength="1"')),
  ...hot.map(d => p(d, 'cw-hot', ' pathLength="1"')),
 ];
 // the drip
 const drip = `<g class="cw-drip"><path d="M344 ${leakY}q-6 10 0 13q6-3 0-13z"/><path d="M344 ${leakY + 22}q-5 8 0 11q5-3 0-11z"/></g>`;

 const flip = mirror ? ` transform="translate(${W} 0) scale(-1 1)"` : '';
 const X = x => (mirror ? W - x : x);
 const at = {
  leak: [344, leakY + 4], bath: [300, (HOUSES[kind] || HOUSES.cottage).floors.slice(-1)[0][1] - 40],
  kitchen: [618, (HOUSES[kind] || HOUSES.cottage).floors[0][1] - 60], heater: [496, 548], main: [712, 532],
  street: [860, 590], sewer: [860, BF + 50], backflow: [643, BF + 34], sump: [183, BF + 42], floordrain: [300, BF - 22],
  outdoor: [X1 + 22, 418],
 };
 const markers = spots.filter(s => at[s.zone]).map(s => {
  const [x, y] = at[s.zone];
  // A <g>, not an SVG <a>: an SVG link's href is an object, and Cloudflare's email-decode script
  // (injected on pages with an address) crashes on it. The numbered legend holds the real links.
  return `<g class="cw-spot" data-href="${s.href}" data-spot="${s.n}" aria-hidden="true"><circle cx="${X(x)}" cy="${y}" r="17" class="cw-spot-ring"/><circle cx="${X(x)}" cy="${y}" r="13" class="cw-spot-dot"/><text x="${X(x)}" y="${y + 5}" text-anchor="middle" class="cw-spot-n">${s.n}</text></g>`;
 });
 let view = `0 0 ${W} ${H}`;
 if (zone) {
  const [x, y, w, h] = crops(kind)[zone] || crops(kind).house;
  view = `${mirror ? W - x - w : x} ${y} ${w} ${h}`;
 }
 const label = title ? ` role="img" aria-label="${title}"` : ' aria-hidden="true" focusable="false"';
 return `<svg class="cutaway cw-${kind}${zone ? ' cw-detail' : ''}" viewBox="${view}"${label} xmlns="http://www.w3.org/2000/svg"><g${flip}>${art.join('')}<g class="cw-pipes">${pipes.join('')}</g>${drip}</g>${markers.join('')}</svg>`;
}

/** Which zones exist on the drawing (a service whose zones are all missing gets no marker). */
const ZONES = ['leak', 'bath', 'kitchen', 'heater', 'main', 'street', 'sewer', 'backflow', 'sump', 'floordrain', 'outdoor'];

/** Standalone CSS for exporting the drawing as a file (share images, letters). */
function standaloneStyle(t) {
 return `<style>${css().replace(/var\(--([a-z0-9-]+)\)/g, (m, k) => t[k] || m)}</style>`;
}

/** The drawing's stylesheet (also inlined in the site CSS). */
function css() {
 return `.cw-soil{fill:var(--soil)}.cw-stone{fill:var(--soil-dot)}.cw-grass{fill:var(--soil-dot)}.cw-curb{fill:var(--line2)}.cw-road{fill:var(--ink);opacity:.82}
.cw-shrub{fill:var(--soil-dot);opacity:.55}.cw-trunk{fill:var(--soil-dot);opacity:.7}
.cw-room{fill:var(--room)}.cw-cellar{fill:var(--wash)}.cw-attic{fill:var(--wash)}.cw-roof{fill:none;stroke:var(--wall);stroke-width:14;stroke-linejoin:round;stroke-linecap:round}
.cw-wall,.cw-slab{fill:var(--wall)}.cw-cornice{fill:var(--wall)}.cw-dent{fill:var(--room)}.cw-glass{fill:var(--glass)}.cw-part{fill:var(--line2)}
.cw-balcony{fill:var(--wall)}.cw-rail{fill:none;stroke:var(--wall);stroke-width:4;stroke-linecap:round}
.cw-fix{fill:var(--sheet);stroke:var(--wall);stroke-width:3;stroke-linejoin:round}.cw-fix-line{fill:none;stroke:var(--wall);stroke-width:3}.cw-basin{fill:var(--glass);stroke:var(--wall);stroke-width:3}
.cw-tap{fill:var(--wall)}.cw-tap-line{fill:none;stroke:var(--wall);stroke-width:4;stroke-linecap:round}
.cw-heater{fill:var(--sheet);stroke:var(--wall);stroke-width:3}.cw-heater-line{fill:none;stroke:var(--wall);stroke-width:3}.cw-heater-panel{fill:var(--wall)}.cw-gauge{fill:var(--accent)}
.cw-meter{fill:var(--sheet);stroke:var(--wall);stroke-width:3;rx:4}.cw-valve{fill:var(--accent)}.cw-valve-stem{stroke:var(--wall);stroke-width:4;stroke-linecap:round}
.cw-sensor{fill:var(--accent)}.cw-pit{fill:var(--soil);stroke:var(--wall);stroke-width:4}.cw-water{fill:var(--cold);opacity:.35}.cw-pump{fill:var(--wall);rx:4}
.cw-discharge{stroke:var(--drain);stroke-width:8;stroke-linecap:round}.cw-grate{fill:var(--wall)}
.cw-backflow{fill:var(--sheet);stroke:var(--wall);stroke-width:3;rx:5}.cw-flap{fill:var(--accent)}
.cw-main{fill:var(--sheet);stroke:var(--cold);stroke-width:6}.cw-sewer{fill:var(--sheet);stroke:var(--drain);stroke-width:8}.cw-sewer-in{fill:var(--line2)}
.cw-curbstop{stroke:var(--wall);stroke-width:5}.cw-curbcap{fill:var(--wall)}.cw-sillcock{fill:none;stroke:var(--wall);stroke-width:5;stroke-linejoin:round;stroke-linecap:round}
.cw-drain{fill:none;stroke:var(--drain);stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.cw-cold,.cw-hot{fill:none;stroke-width:5.5;stroke-linecap:round;stroke-linejoin:round}.cw-cold{stroke:var(--cold)}.cw-hot{stroke:var(--hot)}
.cw-drip path{fill:var(--cold)}
.cw-spot{cursor:pointer;outline:none}.cw-spot-ring{fill:var(--sheet);opacity:.9}.cw-spot-dot{fill:var(--ink);transition:fill .15s}.cw-spot-n{fill:var(--sheet);font:700 15px/1 var(--font-text),system-ui,sans-serif;pointer-events:none}
.cw-spot:hover .cw-spot-dot,.cw-spot.is-lit .cw-spot-dot{fill:var(--accent)}.cw-spot:hover .cw-spot-n,.cw-spot.is-lit .cw-spot-n{fill:var(--on-accent)}`;
}

module.exports = { render, css, standaloneStyle, crops, ZONES, W, H };
