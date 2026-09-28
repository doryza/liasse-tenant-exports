/**
 * Card themes. Five ready-made palettes plus a custom one built from three
 * owner colours; every theme resolves to the same CSS custom properties, so the
 * page never branches on the theme name.
 */
const THEMES = {
  ivoire: { name: { fr: 'Ivoire', en: 'Ivory' }, bg: '#F5F2EC', surface: '#FFFFFF', ink: '#16171A', muted: '#66676D', line: '#E5E0D6', accent: '#2858EF', font: 'serif' },
  nuit: { name: { fr: 'Nuit', en: 'Night' }, bg: '#0E1014', surface: '#161A21', ink: '#F1F0EC', muted: '#9CA2AC', line: '#272C36', accent: '#8FAAFF', font: 'serif' },
  ardoise: { name: { fr: 'Ardoise', en: 'Slate' }, bg: '#E7EBEF', surface: '#FFFFFF', ink: '#18222D', muted: '#586675', line: '#D3DAE1', accent: '#18222D', font: 'sans' },
  sauge: { name: { fr: 'Sauge', en: 'Sage' }, bg: '#ECEFE7', surface: '#F9FAF6', ink: '#1E291D', muted: '#5B6858', line: '#D8DFD1', accent: '#4A6741', font: 'serif' },
  terre: { name: { fr: 'Terre', en: 'Clay' }, bg: '#F3EAE1', surface: '#FFF9F3', ink: '#2A1C15', muted: '#786254', line: '#E7D7C8', accent: '#B0502A', font: 'serif' },
};
const FONTS = ['serif', 'sans'];
const HEX = /^#[0-9a-fA-F]{6}$/;

function rgb(hex) { return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); }
function hex(parts) { return '#' + parts.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function mix(a, b, weight) { const x = rgb(a); const y = rgb(b); return hex(x.map((v, i) => v * (1 - weight) + y[i] * weight)); }
function luminance(value) {
  const [r, g, b] = rgb(value).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }

/** Resolve the owner's settings to a full, contrast-safe palette. */
function resolve(settings) {
  const key = THEMES[settings.theme] ? settings.theme : (settings.theme === 'custom' ? 'custom' : 'ivoire');
  let t;
  if (key === 'custom') {
    const bg = HEX.test(settings.theme_bg || '') ? settings.theme_bg.toUpperCase() : THEMES.ivoire.bg;
    let ink = HEX.test(settings.theme_ink || '') ? settings.theme_ink.toUpperCase() : THEMES.ivoire.ink;
    // Keep text readable whatever the owner picks.
    if (contrast(bg, ink) < 4.5) ink = luminance(bg) > 0.35 ? '#111111' : '#F5F5F5';
    const accent = HEX.test(settings.theme_accent || '') ? settings.theme_accent.toUpperCase() : ink;
    const dark = luminance(bg) < 0.2;
    t = { bg, ink, accent, surface: dark ? mix(bg, '#FFFFFF', 0.05) : mix(bg, '#FFFFFF', 0.6), muted: mix(ink, bg, 0.42), line: mix(ink, bg, 0.84),
      font: FONTS.includes(settings.theme_font) ? settings.theme_font : 'serif' };
  } else {
    t = { ...THEMES[key] };
    if (FONTS.includes(settings.theme_font)) t.font = settings.theme_font;
  }
  t.key = key;
  // Text on the accent button: whichever of ink-white or ink-black reads better.
  t.onAccent = contrast(t.accent, '#FFFFFF') >= contrast(t.accent, '#111111') ? '#FFFFFF' : '#111111';
  t.accentSoft = mix(t.accent, t.surface, 0.86);
  t.dark = luminance(t.bg) < 0.2;
  return t;
}

/** CSS custom properties for a resolved theme; every value is a validated hex. */
function cssVars(t) {
  return `--bg:${t.bg};--surface:${t.surface};--ink:${t.ink};--muted:${t.muted};--line:${t.line};--accent:${t.accent};--on-accent:${t.onAccent};--accent-soft:${t.accentSoft};`;
}

module.exports = { THEMES, FONTS, HEX, resolve, cssVars, contrast };
