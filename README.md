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

## Interaction

- Hover container: thumb fades in (0.35s ease)
- Hover thumb: track expands from 0 to 14px width
- Drag thumb: cursor switches to grab icon, content scrolls proportionally
- Release / leave: track collapses, thumb fades out

## Shadow DOM Structure

```
v-scroll (host, position: relative)
  #shadow-root (open)
    <b part="scroll">        scroll container (overflow: auto)
      <b part="content">     content wrapper
        <slot>               projects light DOM
    <b part="track">          scrollbar track (full height, right side)
    <b part="bar">            draggable thumb
```

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
v-scroll::part(content) { /* content wrapper */ }
v-scroll::part(track)   { /* scrollbar track */ }
v-scroll::part(bar)     { /* draggable thumb */ }
```

Switch themes by changing the import map path:

```html
<script type="importmap">
  {"imports":{"$/":"/themes/my-theme/"}}
</script>
```

## Performance

- `requestAnimationFrame` throttling on scroll events (one update per frame)
- CSS variable writes skipped when values unchanged
- Drag dimensions cached on `pointerdown`, not recalculated per `pointermove`
- `passive: true` on scroll listener for smoother scrolling
- Module-level flag for style injection (no DOM query)
- Pending rAF cancelled on component disconnect

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
