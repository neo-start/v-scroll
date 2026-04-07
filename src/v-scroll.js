import css_text from "$/v-scroll.js"
import svg_scroll from "./scroll.svg?raw"
import svg_grab from "./grab.svg?raw"

const THUMB_PAD = 3, MIN_THUMB = 16

const svgCursor = (svg, x, y) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}") ${x} ${y}, auto`

const CURSOR_SCROLL = svgCursor(svg_scroll, 10, 10),
  CURSOR_GRAB = svgCursor(svg_grab, 7, 7),
  CURSOR_CSS = `v-scroll::part(bar){cursor:${CURSOR_SCROLL}}v-scroll::part(bar drag),body.v-scroll-drag{cursor:${CURSOR_GRAB}}`

let styles_injected = false

const injectStyles = () => {
  if (styles_injected) return
  styles_injected = true
  const el = document.createElement("style")
  el.id = "v-scroll-styles"
  el.textContent = css_text + CURSOR_CSS
  document.head.appendChild(el)
}

const calcThumb = (viewport_h, content_h, track_h) =>
  Math.max(MIN_THUMB, (viewport_h / content_h) * track_h)

const calcThumbTop = (scroll_top, max_scroll, track_h, thumb_h) =>
  max_scroll === 0 ? THUMB_PAD
    : THUMB_PAD + (scroll_top / max_scroll) * (track_h - thumb_h - THUMB_PAD * 2)

const setBarVars = (host, h, top, opacity) => {
  const s = host.style
  if (s.getPropertyValue("--bar-h") !== h) s.setProperty("--bar-h", h)
  if (s.getPropertyValue("--bar-top") !== top) s.setProperty("--bar-top", top)
  if (s.getPropertyValue("--bar-opacity") !== opacity) s.setProperty("--bar-opacity", opacity)
}

const updateBar = (host, scroll_el, track_el, bar_el) => {
  const viewport_h = scroll_el.clientHeight,
    content_h = scroll_el.scrollHeight,
    scroll_top = scroll_el.scrollTop,
    max_scroll = content_h - viewport_h,
    track_h = track_el.clientHeight,
    visible = content_h > viewport_h

  if (!visible) {
    setBarVars(host, "0", "0", "0")
    if (bar_el.part.contains("turned")) bar_el.part.remove("turned")
    return
  }

  const thumb_h = calcThumb(viewport_h, content_h, track_h),
    thumb_top = calcThumbTop(scroll_top, max_scroll, track_h, thumb_h)

  setBarVars(host, thumb_h + "px", (track_el.offsetTop + thumb_top) + "px", "1")
  if (!bar_el.part.contains("turned")) bar_el.part.add("turned")
}

const setupDrag = (host, scroll_el, track_el, bar_el) => {
  let drag_y = 0, drag_scroll = 0, drag_max = 0, drag_range = 0

  const onMove = e => {
    if (drag_range <= 0) return
    const delta = e.clientY - drag_y
    scroll_el.scrollTop = Math.min(Math.max(drag_scroll + (delta / drag_range) * drag_max, 0), drag_max)
  }

  const onEnd = e => {
    if (bar_el.hasPointerCapture(e.pointerId)) bar_el.releasePointerCapture(e.pointerId)
    bar_el.removeEventListener("pointermove", onMove)
    bar_el.removeEventListener("pointerup", onEnd)
    bar_el.removeEventListener("pointercancel", onEnd)
    bar_el.part.remove("drag")
    host.classList.remove("drag")
    host.classList.remove("bar-hover")
    document.body?.classList.remove("v-scroll-drag")
  }

  const onDown = e => {
    e.preventDefault()
    const viewport_h = scroll_el.clientHeight,
      content_h = scroll_el.scrollHeight,
      track_h = track_el.clientHeight,
      thumb_h = calcThumb(viewport_h, content_h, track_h)
    drag_y = e.clientY
    drag_scroll = scroll_el.scrollTop
    drag_max = content_h - viewport_h
    drag_range = track_h - thumb_h - THUMB_PAD * 2
    bar_el.part.add("drag")
    host.classList.add("drag")
    document.body?.classList.add("v-scroll-drag")
    bar_el.setPointerCapture(e.pointerId)
    bar_el.addEventListener("pointermove", onMove)
    bar_el.addEventListener("pointerup", onEnd)
    bar_el.addEventListener("pointercancel", onEnd)
  }

  bar_el.addEventListener("pointerdown", onDown)
  return () => {
    bar_el.part.remove("drag")
    host.classList.remove("drag")
    document.body?.classList.remove("v-scroll-drag")
    bar_el.removeEventListener("pointerdown", onDown)
    bar_el.removeEventListener("pointermove", onMove)
    bar_el.removeEventListener("pointerup", onEnd)
    bar_el.removeEventListener("pointercancel", onEnd)
  }
}

const connect = host => {
  injectStyles()
  const shadow = host.attachShadow({ mode: "open" }),
    scroll_el = document.createElement("b"),
    content_el = document.createElement("b"),
    slot_el = document.createElement("slot"),
    track_el = document.createElement("b"),
    bar_el = document.createElement("b")

  scroll_el.setAttribute("part", "scroll")
  content_el.setAttribute("part", "content")
  track_el.setAttribute("part", "track")
  bar_el.setAttribute("part", "bar")

  content_el.appendChild(slot_el)
  scroll_el.appendChild(content_el)
  shadow.appendChild(scroll_el)
  shadow.appendChild(track_el)
  shadow.appendChild(bar_el)

  bar_el.addEventListener("mouseenter", () => host.classList.add("bar-hover"))
  bar_el.addEventListener("mouseleave", () => { if (!host.classList.contains("drag")) host.classList.remove("bar-hover") })

  let raf_id = 0
  const update = () => {
    if (raf_id) return
    raf_id = requestAnimationFrame(() => {
      raf_id = 0
      updateBar(host, scroll_el, track_el, bar_el)
    })
  }

  scroll_el.addEventListener("scroll", update, { passive: true })

  const ro = new ResizeObserver(update)
  ro.observe(scroll_el)
  slot_el.addEventListener("slotchange", () => {
    slot_el.assignedElements().forEach(el => ro.observe(el))
    update()
  })

  host._update = update
  host._raf_id = () => raf_id
  host._cancel_raf = () => { if (raf_id) { cancelAnimationFrame(raf_id); raf_id = 0 } }
  host._ro = ro
  host._cleanup_drag = setupDrag(host, scroll_el, track_el, bar_el)
  host._scroll_el = scroll_el
  update()
}

const disconnect = host => {
  host._cancel_raf?.()
  if (host._ro) { host._ro.disconnect(); host._ro = null }
  if (host._cleanup_drag) { host._cleanup_drag(); host._cleanup_drag = null }
  if (host._scroll_el) {
    host._scroll_el.removeEventListener("scroll", host._update)
    host._scroll_el = null
  }
}

customElements.define("v-scroll", class extends HTMLElement {
  connectedCallback() { connect(this) }
  disconnectedCallback() { disconnect(this) }
})
