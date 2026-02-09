import { drawTextOverlay, getTextOverlayBounds } from './textOverlay.js'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Handles rendering the current image + overlays to a single canvas.
 * The canvas's internal pixel size is kept at "export resolution",
 * while CSS scales it for preview.
 */
export class MemeCanvas {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'))

    /** @type {HTMLImageElement | null} */
    this.image = null

    /** @type {Array<any>} */
    this.overlays = []

    /** @type {string | null} */
    this.activeOverlayId = null

    this.background = 'rgba(0,0,0,.18)'
  }

  /**
   * @param {HTMLImageElement | null} image
   * @param {{ maxDimension?: number }} [opts]
   */
  setImage(image, opts = {}) {
    this.image = image

    if (!image) {
      // Keep a friendly default size
      this._setInternalSize(800, 450)
      return
    }

    const maxDimension = typeof opts.maxDimension === 'number' ? opts.maxDimension : 1600
    const naturalW = image.naturalWidth || image.width
    const naturalH = image.naturalHeight || image.height

    if (!naturalW || !naturalH) {
      this._setInternalSize(800, 450)
      return
    }

    const scale = Math.min(1, maxDimension / Math.max(naturalW, naturalH))
    const w = Math.max(1, Math.round(naturalW * scale))
    const h = Math.max(1, Math.round(naturalH * scale))
    this._setInternalSize(w, h)
  }

  /**
   * @param {Array<any>} overlays
   */
  setOverlays(overlays) {
    this.overlays = overlays
  }

  /**
   * @param {string | null} id
   */
  setActiveOverlayId(id) {
    this.activeOverlayId = id
  }

  /**
   * Convert client coords (mouse/touch) to canvas coords.
   * @param {number} clientX
   * @param {number} clientY
   */
  clientToCanvasPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect()
    const sx = this.canvas.width / rect.width
    const sy = this.canvas.height / rect.height
    return {
      x: (clientX - rect.left) * sx,
      y: (clientY - rect.top) * sy,
    }
  }

  /**
   * Redraw image + overlays.
   */
  draw() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    ctx.save()
    ctx.clearRect(0, 0, w, h)

    // Background (for transparent images)
    ctx.fillStyle = this.background
    ctx.fillRect(0, 0, w, h)

    // Image
    if (this.image) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(this.image, 0, 0, w, h)
    } else {
      // Placeholder message
      ctx.fillStyle = 'rgba(255,255,255,.08)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(255,255,255,.75)'
      ctx.font = '700 22px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Upload an image or pick a random template', w / 2, h / 2)
    }

    // Overlays
    for (const overlay of this.overlays) {
      const isActive = overlay.id === this.activeOverlayId
      drawTextOverlay(ctx, overlay, { isActive })

      if (isActive) {
        const bounds = getTextOverlayBounds(ctx, overlay)
        if (bounds) {
          ctx.save()
          ctx.strokeStyle = 'rgba(109,123,255,.9)'
          ctx.lineWidth = 2
          ctx.setLineDash([6, 4])
          ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h)
          ctx.restore()
        }
      }
    }

    ctx.restore()
  }

  /**
   * Ensure the active overlay stays inside the canvas.
   * @param {any} overlay
   */
  clampOverlayToCanvas(overlay) {
    overlay.x = clamp(overlay.x, 0, this.canvas.width)
    overlay.y = clamp(overlay.y, 0, this.canvas.height)
  }

  _setInternalSize(w, h) {
    this.canvas.width = w
    this.canvas.height = h
  }
}

