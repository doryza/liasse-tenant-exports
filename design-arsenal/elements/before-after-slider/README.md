# Before/After Comparison Slider

An interactive image-comparison slider: two photos of the same scene stacked, with a
draggable divider that reveals the "after" over the "before". Works with mouse, touch,
pen, and keyboard. No dependencies, multi-instance safe, themeable via CSS tokens.

**Provenance:** extracted 2026-06-11 from `testing/imported-apps/ammenagementpaysager_gm`
(`views/galerie.ejs`, `public/css/styles.css:60-68`, `public/js/app.js`). Hardened during
extraction: mouse+touch listeners replaced with pointer events (adds pen support, removes
per-instance `window` listener leaks), keyboard accessibility added (`role="slider"`,
arrow keys), design tokens replace the source app's hardcoded brand color/radii,
`touch-action: pan-y` keeps vertical page scrolling alive on touch.

## Use when

The business **transforms something visible** and the user's description implies
before/after outcomes. Prescriptive triggers:

- landscaping, paving, exterior renovation, roofing, painting
- cleaning, pressure-washing, detailing (auto/boat), carpet/upholstery
- restoration (furniture, masonry, headlights), bodywork
- hair/beauty makeovers, home staging, organization services
- fitness/coaching transformations (with client consent noted)

## Don't use when

- The work has no visual before-state (consulting, software, food service, retail).
- Only one image per project exists — the element needs true pairs; a lone photo in a
  slider is worse than a plain gallery card.
- As filler. If the description doesn't sell transformation outcomes, skip it.

## Data model

A gallery-style table with paired image columns (single `image_url` kept as fallback):

```sql
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  image_url TEXT,             -- legacy/fallback single image
  category TEXT,
  published INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Admin CRUD must offer **both** uploads side by side, labeled, so pairs stay matched.

## Generated-image pairing

When build-time image generation supplies the pair, the two prompts must describe the
**identical scene and camera** and vary only the state. Generate the *after* first, then
reuse its composition language verbatim in the *before* prompt:

- after: "Elevated three-quarter view of a small suburban backyard, cedar fence, maple
  at left — finished landscaped yard: fresh sod, paver path, trimmed hedge beds."
- before: "Elevated three-quarter view of a small suburban backyard, cedar fence, maple
  at left — neglected yard: patchy dirt and weeds, no path, overgrown shrubs."

Same aspect ratio for both (the element crops with `object-fit: cover`, but matched
framing is what sells the comparison). Default `4:3`.

## Markup (EJS)

Labels shown here in French; bind to the app's i18n. The handle is a real `<button>`
so it is focusable and announces as a slider.

```ejs
<div class="before-after">
<img src="<%= g.before_image_url || g.image_url %>" alt="Avant — <%= g.title %>" loading="lazy">
<img class="ba-after" src="<%= g.after_image_url || g.image_url %>" alt="Après — <%= g.title %>" loading="lazy">
<span class="ba-label before">AVANT</span>
<span class="ba-label after">APRÈS</span>
<button class="ba-handle" type="button" role="slider" aria-label="Comparer avant et après" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></button>
</div>
```

Guard the loop: render the element only when at least one of the pair columns is set;
otherwise fall back to a plain image card.

## CSS

Skin via the `--ba-*` tokens (set them on `.before-after` or an ancestor). Neutral
fallbacks render acceptably in any design system.

```css
/* before-after slider — design-arsenal element */
.before-after{position:relative;width:100%;aspect-ratio:var(--ba-ratio,4/3);overflow:hidden;border-radius:var(--ba-radius,0.75rem);cursor:ew-resize;user-select:none;-webkit-user-select:none;background:#000;touch-action:pan-y}
.before-after img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.before-after .ba-after{clip-path:inset(0 0 0 50%)}
.ba-handle{position:absolute;top:0;bottom:0;left:50%;width:3px;background:var(--ba-handle,#fff);transform:translateX(-50%);box-shadow:0 0 12px rgba(0,0,0,.5);border:0;padding:0;cursor:ew-resize}
.ba-handle::before{content:'';position:absolute;top:50%;left:50%;width:42px;height:42px;border-radius:var(--ba-knob-radius,50%);background:var(--ba-handle,#fff);transform:translate(-50%,-50%);box-shadow:0 4px 14px rgba(0,0,0,.3)}
.ba-handle::after{content:'⇄';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--ba-accent,#111);font-weight:700;font-size:1.1rem}
.ba-handle:focus-visible{outline:3px solid var(--ba-accent,#fff);outline-offset:2px}
.ba-label{position:absolute;top:.75rem;padding:.3rem .75rem;background:var(--ba-label-bg,rgba(0,0,0,.65));color:var(--ba-label-fg,#fff);border-radius:var(--ba-label-radius,.5rem);font-size:.8rem;font-weight:700;letter-spacing:.5px;pointer-events:none;font-family:var(--ba-label-font,inherit)}
.ba-label.before{left:.75rem}
.ba-label.after{right:.75rem}
```

| Token | Default | Purpose |
|---|---|---|
| `--ba-ratio` | `4/3` | Frame aspect ratio |
| `--ba-radius` | `0.75rem` | Frame corner radius (`0` for squared design systems) |
| `--ba-handle` | `#fff` | Divider line + knob fill |
| `--ba-knob-radius` | `50%` | Knob shape (`2px` for squared systems) |
| `--ba-accent` | `#111` | Knob glyph + focus ring color |
| `--ba-label-bg` / `--ba-label-fg` | dark/white | AVANT/APRÈS chips |
| `--ba-label-radius` / `--ba-label-font` | `.5rem` / inherit | Chip shape/type |

## JS

Idempotent (`data-ba-init` guard), per-instance, exposes `window.initBeforeAfter(root)`
for content injected after load.

```js
(function(){
function initBeforeAfter(root){
(root||document).querySelectorAll('.before-after').forEach(function(ba){
if(ba.dataset.baInit)return;ba.dataset.baInit='1';
var after=ba.querySelector('.ba-after'),handle=ba.querySelector('.ba-handle');
if(!after||!handle)return;
function set(pct){pct=Math.max(0,Math.min(100,pct));after.style.clipPath='inset(0 0 0 '+pct+'%)';handle.style.left=pct+'%';handle.setAttribute('aria-valuenow',String(Math.round(pct)));}
function pctFromX(x){var r=ba.getBoundingClientRect();return (x-r.left)/r.width*100;}
ba.addEventListener('pointerdown',function(e){try{ba.setPointerCapture(e.pointerId);}catch(err){}set(pctFromX(e.clientX));e.preventDefault();});
ba.addEventListener('pointermove',function(e){if(ba.hasPointerCapture&&ba.hasPointerCapture(e.pointerId))set(pctFromX(e.clientX));});
handle.addEventListener('keydown',function(e){
var cur=parseFloat(handle.getAttribute('aria-valuenow'))||50,step=e.shiftKey?10:5;
if(e.key==='ArrowLeft'){set(cur-step);e.preventDefault();}
else if(e.key==='ArrowRight'){set(cur+step);e.preventDefault();}
else if(e.key==='Home'){set(0);e.preventDefault();}
else if(e.key==='End'){set(100);e.preventDefault();}
});
});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){initBeforeAfter();});
else initBeforeAfter();
window.initBeforeAfter=initBeforeAfter;
})();
```

## Placement patterns (from the source app)

- **Gallery page**: grid of sliders, each followed by category badge + title + description.
- **Homepage teaser**: `gallery.slice(0, 2)` as a two-up section linking to the full
  gallery — the interactive element is a strong above-the-fold hook for transformation
  businesses.

## Verified

Extracted version tested standalone in headless Chromium (2026-06-11): pointer drag
updates clip-path and `aria-valuenow`; arrow keys / Home / End move the divider with
focus ring visible; two instances on one page operate independently; vertical touch
scroll preserved (`touch-action: pan-y`).
