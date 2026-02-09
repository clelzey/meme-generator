function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

/**
 * @typedef {'left' | 'center' | 'right'} TextAlign
 */

/**
 * @typedef {Object} TextOverlay
 * @property {string} id
 * @property {string} text
 * @property {number} x
 * @property {number} y
 * @property {number} fontSize
 * @property {string} fontFamily
 * @property {string} fillColor
 * @property {string} strokeColor
 * @property {number} strokeWidth
 * @property {TextAlign} align
 * @property {number} [maxWidth]
 * @property {number} [fontWeight]
 */

/**
 * @param {{ canvasWidth: number, canvasHeight: number, text?: string }} params
 * @returns {TextOverlay}
 */
export function createTextOverlay({ canvasWidth, canvasHeight, text }) {
  return {
    id: uid(),
    text: typeof text === 'string' ? text : 'Your text',
    x: Math.round(canvasWidth / 2),
    y: Math.round(Math.min(canvasHeight * 0.15, 90)),
    fontSize: 56,
    fontFamily: 'Impact, Arial Black, system-ui, sans-serif',
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 10,
    align: 'center',
    maxWidth: Math.round(canvasWidth * 0.92),
    fontWeight: 900,
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextOverlay} overlay
 */
export function applyTextStyle(ctx, overlay) {
  const weight = overlay.fontWeight ?? 900
  ctx.font = `${weight} ${overlay.fontSize}px ${overlay.fontFamily}`
  ctx.textAlign = overlay.align
  ctx.textBaseline = 'top'
  ctx.fillStyle = overlay.fillColor
  ctx.strokeStyle = overlay.strokeColor
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextOverlay} overlay
 * @returns {{ lines: string[], lineHeight: number, maxWidth: number }}
 */
export function layoutText(ctx, overlay) {
  applyTextStyle(ctx, overlay)
  const maxWidth = Math.max(80, overlay.maxWidth ?? Math.round(ctx.canvas.width * 0.92))
  const raw = (overlay.text ?? '').toString()
  const paragraphs = raw.split('\n')
  const lines = []

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }

    let current = words[0]
    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`
      const w = ctx.measureText(next).width
      if (w <= maxWidth) {
        current = next
      } else {
        lines.push(current)
        current = words[i]
      }
    }
    lines.push(current)
  }

  const lineHeight = Math.max(1, Math.round(overlay.fontSize * 1.12))
  return { lines, lineHeight, maxWidth }
}

/**
 * Get a conservative bounding box for selection / hit-testing.
 * Note: Bounding box ignores stroke width slightly for simplicity.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextOverlay} overlay
 * @returns {{ x: number, y: number, w: number, h: number } | null}
 */
export function getTextOverlayBounds(ctx, overlay) {
  const { lines, lineHeight } = layoutText(ctx, overlay)
  if (!lines.length) return null

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY

  for (const line of lines) {
    const lineWidth = ctx.measureText(line).width
    let startX = overlay.x
    if (overlay.align === 'center') startX = overlay.x - lineWidth / 2
    if (overlay.align === 'right') startX = overlay.x - lineWidth
    minX = Math.min(minX, startX)
    maxX = Math.max(maxX, startX + lineWidth)
  }

  const pad = Math.max(6, Math.round((overlay.strokeWidth ?? 0) / 2))
  const x = Math.round(minX - pad)
  const y = Math.round(overlay.y - pad)
  const w = Math.round(maxX - minX + pad * 2)
  const h = Math.round(lines.length * lineHeight + pad * 2)
  return { x, y, w, h }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextOverlay} overlay
 * @param {{ isActive?: boolean }} [opts]
 */
export function drawTextOverlay(ctx, overlay, opts = {}) {
  const { lines, lineHeight } = layoutText(ctx, overlay)

  // Outline first (classic meme look)
  const strokeWidth = overlay.strokeWidth ?? 0
  if (strokeWidth > 0) {
    ctx.lineWidth = strokeWidth
    for (let i = 0; i < lines.length; i++) {
      const y = overlay.y + i * lineHeight
      ctx.strokeText(lines[i], overlay.x, y)
    }
  }

  // Fill
  for (let i = 0; i < lines.length; i++) {
    const y = overlay.y + i * lineHeight
    ctx.fillText(lines[i], overlay.x, y)
  }

  if (opts.isActive) {
    // Small anchor dot at (x,y)
    ctx.save()
    ctx.fillStyle = 'rgba(109,123,255,.95)'
    ctx.strokeStyle = 'rgba(0,0,0,.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(overlay.x, overlay.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextOverlay} overlay
 * @param {{ x: number, y: number }} point
 */
export function hitTestTextOverlay(ctx, overlay, point) {
  const bounds = getTextOverlayBounds(ctx, overlay)
  if (!bounds) return false
  return (
    point.x >= bounds.x &&
    point.y >= bounds.y &&
    point.x <= bounds.x + bounds.w &&
    point.y <= bounds.y + bounds.h
  )
}

