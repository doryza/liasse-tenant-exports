# Design Arsenal

A curated collection of proven, reusable design elements extracted from built tenant apps.
Each element earned its place by working well in a real app; it is saved here in a
**design-system-agnostic** form so any future build — whatever its visual identity — can
adopt it and skin it.

## How this collection is used

1. **Human review** — browse elements when art-directing a new app or reviewing a build.
2. **AI app builder** — the builder's design-brief stage receives each element's
   *trigger conditions* and may pull the full snippet into the build prompt when the
   user's app description warrants it. Elements are deliberately single-file
   (`elements/<name>/README.md` contains the complete spec + code) so they can be
   inlined into a prompt verbatim.

## Element format

```
design-arsenal/elements/<element-name>/README.md
```

One file per element, containing:

- **Use when / Don't use when** — prescriptive trigger conditions (the builder's
  design-brief stage decides inclusion from these, never includes by default).
- **Provenance** — which app it came from, and what was changed during extraction.
- **Data model** — schema the element expects, if any.
- **The code** — markup (EJS), CSS (themeable via `--*` custom-property tokens with
  fallbacks, no framework), JS (vanilla, no dependencies, multi-instance safe).
- **Image guidance** — art-direction notes when the element consumes generated images.

## Rules for adding elements

- Extract from a real, working app; note the source and export date.
- Strip the source app's design system: colors/radii/fonts become `--token`
  custom properties with neutral fallbacks.
- Harden before saving: keyboard accessibility, touch + mouse via pointer events,
  multi-instance init, no global state leaks, null-data tolerance.
- Test the extracted element standalone in a browser before committing.

## Elements

| Element | Use case | Source app |
|---|---|---|
| [before-after-slider](elements/before-after-slider/README.md) | Interactive comparison of two states of the same scene (transformations, makeovers, restorations) | ammenagementpaysager_gm (2026-06) |
