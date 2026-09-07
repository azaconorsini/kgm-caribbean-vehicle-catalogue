# Catalogue Filter UX

Three lightweight front-end features for WordPress vehicle catalogues built on
**Impreza / UpSolution (us-core)** grid filters.

Vanilla JavaScript and CSS. No build step, no dependencies, no jQuery.

Extracted from a vehicle catalogue page I designed and built — the layout, the
card grid, the filter UI and the individual vehicle pages — and packaged here
so the interactive parts can be reused.

![Vehicle catalogue page](screenshots/catalogue-page.jpg)

---

## Features

### Active filter chips

Shows the visitor exactly what they've filtered by, as removable chips above
the grid.

- One chip per active filter, colour-coded by type
- Click the ✕ on any chip to clear just that filter
- **Clear All** resets everything in one click
- The whole bar hides itself when no filters are active

Works with both filter styles the theme produces — radio buttons and dropdown
selects — in the same bar.

### Live result counter

A running count above the grid:

> Showing **3** of **6** available models

Updates automatically every time the filter runs. No page reload.

### Colour swatch picker

On individual vehicle pages, visitors click a colour swatch to switch the
gallery to that colour and see its name.

- Clicking a swatch activates the matching gallery tab
- The selected swatch is highlighted
- The colour name prints to a label below

---

## Installation

**1. Add the JavaScript**

Copy `src/catalogue-filter-ux.js` into **Theme Options → Custom CSS/JS → Custom JS**.

**2. Add the CSS**

Copy `src/catalogue-filter-ux.css` into **Theme Options → Custom CSS/JS → Custom CSS**.

**3. Add the markup**

- Give the row that should hold the chips the CSS ID `active-filter`.
- For the counter, paste `snippets/catalogue-counter.html` into an HTML block
  above your grid.
- For the image hover zoom, add the class `vehicle-img` to the image element in
  your grid layout.

**4. Set your filters**

Edit the `FACETS` array at the top of the JavaScript:

```js
var FACETS = [
  { name: "vehicle_territory", prefix: "Region", cls: "kgm-region" },
  { name: "vehicle_tech",      prefix: "Engine", cls: "kgm-engine" }
];
```

- `name` — the taxonomy slug used by the filter
- `prefix` — the label shown on the chip
- `cls` — the colour rule in the stylesheet

Adding another filter takes one entry here and one CSS rule. Nothing else in
the code is tied to a specific filter name.

---

## What's included

```
src/catalogue-filter-ux.js     Chips, counter and swatch picker
src/catalogue-filter-ux.css    Chip styles, card layout, image hover zoom
snippets/catalogue-counter.html  Markup for the result counter
screenshots/                     Page and feature screenshots
```

The stylesheet also contains two card-layout helpers from the original design:

- **Aligned CTAs** — buttons line up across a row of uneven-height cards
- **Image hover zoom** — a subtle scale on the card image

---

## Design notes

A few decisions carried over from the page this came from:

- **Chips are colour-coded by filter type**, so region and engine read as two
  different kinds of choice rather than one undifferentiated list.
- **The bar collapses entirely when nothing is filtered** — no empty container,
  no "no filters applied" placeholder taking up space.
- **The count sits above the grid, not below it**, so the answer to "did that
  do anything?" is visible without scrolling.
- **Card CTAs align to a shared baseline** regardless of how long each vehicle
  name runs, which keeps the grid calm.

---

## Requirements

- WordPress with the Impreza / UpSolution (us-core) theme
- A grid filter element on the page
- No build tooling — plain JavaScript, drop it in and go

## License

MIT — see [LICENSE](LICENSE).
