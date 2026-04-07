# v-scroll

A zero-dependency custom scrollbar web component built with native Web Components API, Shadow DOM, and Vite.

## Features

- Native `customElements` registration (`<v-scroll>`)
- Shadow DOM with `<slot>` for content projection
- Custom scrollbar track + draggable thumb with pointer capture
- SVG custom cursors (scroll / grab)
- CSS custom properties for theming
- `::part()` selectors for external style control
- ResizeObserver-driven auto thumb sizing (min 16px)
- Vite plugin: auto-generates CSS-as-JS module via `csso` minification
- Import map support (`$/`) for theme switching

## Usage

```html
<script type="importmap">
  {"imports":{"$/":"/themes/default/"}}
</script>
<script type="module" src="/src/v-scroll.js"></script>

<v-scroll style="width:320px;height:630px;">
  <div>Your scrollable content</div>
</v-scroll>
```

## Theming

Override CSS custom properties:

```css
v-scroll {
  --track-width: 14px;
  --bar-width: 5px;
  --track-bg: rgba(0,0,0,0.08);
  --bar-color: rgba(0,0,0,0.3);
  --bar-color-hover: rgba(0,0,0,0.5);
  --bar-color-active: rgba(0,0,0,0.65);
}
```

Or use `::part()` selectors:

```css
v-scroll::part(scroll)  { /* scroll container */ }
v-scroll::part(track)   { /* scrollbar track */ }
v-scroll::part(bar)     { /* draggable thumb */ }
```

Switch themes by changing the import map path:

```html
<script type="importmap">
  {"imports":{"$/":"/themes/my-theme/"}}
</script>
```

## Development

```bash
bun i
bun run dev
```

## Build

```bash
./build.sh
```

## License

MIT
