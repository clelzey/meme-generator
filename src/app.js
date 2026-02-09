import { MemeCanvas } from './canvas.js'
import { createTextOverlay, hitTestTextOverlay } from './textOverlay.js'
import { getRandomTemplate, fetchImageObjectUrl } from './api.js'
import { exportCanvasAsPng } from './export.js'

function $(el) {
  return el
}

/**
 * @param {string} msg
 */
function toOneLine(msg) {
  return (msg ?? '').toString().replace(/\s+/g, ' ').trim()
}

/**
 * @param {HTMLImageElement} img
 * @param {string} src
 */
function loadHtmlImage(img, src) {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/**
 * @param {any} deps
 */
export function createApp(deps) {
  const canvasEl = /** @type {HTMLCanvasElement} */ ($(deps.canvas))
  const statusBar = deps.statusBar

  const memeCanvas = new MemeCanvas(canvasEl)

  /** @type {Array<any>} */
  let overlays = []
  /** @type {string | null} */
  let activeId = null

  /** @type {(() => void) | null} */
  let revokeCurrentImage = null

  let isDragging = false
  let dragOffset = { x: 0, y: 0 }

  const ui = {
    uploadInput: deps.uploadInput,
    uploadBtn: deps.uploadBtn,
    randomBtn: deps.randomBtn,
    addTextBtn: deps.addTextBtn,
    exportBtn: deps.exportBtn,
    layersList: deps.layersList,
    layersEmpty: deps.layersEmpty,
    noSelection: deps.noSelection,
    layerForm: deps.layerForm,
    deleteLayerBtn: deps.deleteLayerBtn,
    fields: deps.fields,
  }

  function setStatus(message) {
    if (!statusBar) return
    statusBar.textContent = toOneLine(message)
  }

  function setBusy(isBusy, message) {
    ui.randomBtn.disabled = isBusy
    ui.exportBtn.disabled = isBusy
    ui.addTextBtn.disabled = isBusy
    ui.uploadBtn.disabled = isBusy
    if (message) setStatus(message)
  }

  function setActive(id) {
    activeId = id
    memeCanvas.setActiveOverlayId(activeId)
    renderLayers()
    syncFormFromState()
    memeCanvas.draw()
  }

  function getActiveOverlay() {
    if (!activeId) return null
    return overlays.find((o) => o.id === activeId) ?? null
  }

  function syncFormFromState() {
    const overlay = getActiveOverlay()
    const hasSel = Boolean(overlay)

    ui.noSelection.style.display = hasSel ? 'none' : 'block'
    ui.layerForm.style.display = hasSel ? 'block' : 'none'

    if (!overlay) return
    ui.fields.textValue.value = overlay.text ?? ''
    ui.fields.fontSize.value = String(overlay.fontSize ?? 56)
    ui.fields.fontFamily.value = overlay.fontFamily ?? 'Impact, Arial Black, system-ui, sans-serif'
    ui.fields.fillColor.value = overlay.fillColor ?? '#ffffff'
    ui.fields.strokeColor.value = overlay.strokeColor ?? '#000000'
    ui.fields.strokeWidth.value = String(overlay.strokeWidth ?? 10)
    ui.fields.textAlign.value = overlay.align ?? 'center'
  }

  function updateActiveOverlay(patch) {
    const overlay = getActiveOverlay()
    if (!overlay) return
    Object.assign(overlay, patch)
    overlay.maxWidth = Math.round(canvasEl.width * 0.92)
    memeCanvas.clampOverlayToCanvas(overlay)
    memeCanvas.draw()
    renderLayers()
  }

  function renderLayers() {
    const list = ui.layersList
    list.innerHTML = ''

    ui.layersEmpty.style.display = overlays.length ? 'none' : 'block'

    overlays.forEach((o, idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'layerItem'
      btn.setAttribute('role', 'option')
      btn.setAttribute('aria-selected', o.id === activeId ? 'true' : 'false')
      btn.dataset.layerId = o.id

      const left = document.createElement('div')
      const name = document.createElement('div')
      name.className = 'layerName'
      name.textContent = (o.text ?? '').toString().trim() || `Text layer ${idx + 1}`
      const meta = document.createElement('div')
      meta.className = 'layerMeta'
      meta.textContent = `x ${Math.round(o.x)}, y ${Math.round(o.y)}`
      left.appendChild(name)
      left.appendChild(meta)

      const right = document.createElement('div')
      right.className = 'layerMeta'
      right.textContent = `${o.fontSize}px`

      btn.appendChild(left)
      btn.appendChild(right)

      btn.addEventListener('click', () => setActive(o.id))
      list.appendChild(btn)
    })
  }

  async function setImageFromObjectUrl(objectUrl, revokeFn) {
    if (revokeCurrentImage) revokeCurrentImage()
    revokeCurrentImage = revokeFn ?? null

    const img = new Image()
    img.crossOrigin = 'anonymous'
    await loadHtmlImage(img, objectUrl)

    memeCanvas.setImage(img, { maxDimension: 1600 })
    memeCanvas.draw()

    // Adjust overlay wrapping to the new canvas size.
    overlays.forEach((o) => {
      o.maxWidth = Math.round(canvasEl.width * 0.92)
      memeCanvas.clampOverlayToCanvas(o)
    })
    memeCanvas.setOverlays(overlays)
    memeCanvas.draw()
    setStatus(`Image loaded (${canvasEl.width}×${canvasEl.height}).`)
  }

  async function handleUploadFile(file) {
    if (!file) return
    setBusy(true, 'Loading uploaded image…')
    try {
      const objectUrl = URL.createObjectURL(file)
      await setImageFromObjectUrl(objectUrl, () => URL.revokeObjectURL(objectUrl))
    } catch (e) {
      setStatus(`Upload failed: ${e?.message ?? e}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleRandomTemplate() {
    setBusy(true, 'Fetching random template…')
    try {
      const template = await getRandomTemplate()
      const { objectUrl, revoke } = await fetchImageObjectUrl(template.blank)
      await setImageFromObjectUrl(objectUrl, revoke)
      setStatus(`Template: ${template.name}`)
    } catch (e) {
      setStatus(`Random template failed: ${e?.message ?? e}`)
    } finally {
      setBusy(false)
    }
  }

  function handleAddText() {
    const overlay = createTextOverlay({
      canvasWidth: canvasEl.width,
      canvasHeight: canvasEl.height,
      text: overlays.length ? 'More text' : 'Top text',
    })

    // Stagger new layers a bit.
    overlay.y = Math.round(Math.min(canvasEl.height - 60, overlay.y + overlays.length * (overlay.fontSize * 1.05)))
    overlay.maxWidth = Math.round(canvasEl.width * 0.92)

    overlays.push(overlay)
    memeCanvas.setOverlays(overlays)
    setActive(overlay.id)
    renderLayers()
    memeCanvas.draw()
  }

  function handleDeleteActive() {
    if (!activeId) return
    overlays = overlays.filter((o) => o.id !== activeId)
    memeCanvas.setOverlays(overlays)
    activeId = overlays.length ? overlays[overlays.length - 1].id : null
    memeCanvas.setActiveOverlayId(activeId)
    renderLayers()
    syncFormFromState()
    memeCanvas.draw()
  }

  async function handleExport() {
    try {
      setBusy(true, 'Exporting PNG…')
      await exportCanvasAsPng(canvasEl)
      setStatus('Export complete.')
    } catch (e) {
      setStatus(`Export failed: ${e?.message ?? e}`)
    } finally {
      setBusy(false)
    }
  }

  // Wire UI
  ui.uploadBtn.addEventListener('click', () => ui.uploadInput.click())
  ui.uploadInput.addEventListener('change', (e) => {
    const input = /** @type {HTMLInputElement} */ (e.currentTarget)
    const file = input.files?.[0]
    input.value = '' // allow re-upload same file
    handleUploadFile(file)
  })

  ui.randomBtn.addEventListener('click', handleRandomTemplate)
  ui.addTextBtn.addEventListener('click', handleAddText)
  ui.deleteLayerBtn.addEventListener('click', handleDeleteActive)
  ui.exportBtn.addEventListener('click', handleExport)

  // Form bindings
  ui.fields.textValue.addEventListener('input', (e) =>
    updateActiveOverlay({ text: /** @type {HTMLTextAreaElement} */ (e.currentTarget).value })
  )
  ui.fields.fontSize.addEventListener('input', (e) =>
    updateActiveOverlay({ fontSize: Number(/** @type {HTMLInputElement} */ (e.currentTarget).value) })
  )
  ui.fields.fontFamily.addEventListener('change', (e) =>
    updateActiveOverlay({ fontFamily: /** @type {HTMLSelectElement} */ (e.currentTarget).value })
  )
  ui.fields.fillColor.addEventListener('input', (e) =>
    updateActiveOverlay({ fillColor: /** @type {HTMLInputElement} */ (e.currentTarget).value })
  )
  ui.fields.strokeColor.addEventListener('input', (e) =>
    updateActiveOverlay({ strokeColor: /** @type {HTMLInputElement} */ (e.currentTarget).value })
  )
  ui.fields.strokeWidth.addEventListener('input', (e) =>
    updateActiveOverlay({ strokeWidth: Number(/** @type {HTMLInputElement} */ (e.currentTarget).value) })
  )
  ui.fields.textAlign.addEventListener('change', (e) =>
    updateActiveOverlay({ align: /** @type {HTMLSelectElement} */ (e.currentTarget).value })
  )

  // Dragging on canvas
  canvasEl.addEventListener('pointerdown', (e) => {
    const point = memeCanvas.clientToCanvasPoint(e.clientX, e.clientY)

    // top-most first
    const hit = [...overlays].reverse().find((o) => hitTestTextOverlay(memeCanvas.ctx, o, point))
    if (!hit) {
      setActive(null)
      return
    }

    setActive(hit.id)
    isDragging = true
    dragOffset = { x: hit.x - point.x, y: hit.y - point.y }
    canvasEl.setPointerCapture(e.pointerId)
  })

  canvasEl.addEventListener('pointermove', (e) => {
    if (!isDragging) return
    const overlay = getActiveOverlay()
    if (!overlay) return
    const point = memeCanvas.clientToCanvasPoint(e.clientX, e.clientY)
    overlay.x = point.x + dragOffset.x
    overlay.y = point.y + dragOffset.y
    overlay.maxWidth = Math.round(canvasEl.width * 0.92)
    memeCanvas.clampOverlayToCanvas(overlay)
    syncFormFromState()
    renderLayers()
    memeCanvas.draw()
  })

  function endDrag() {
    isDragging = false
  }

  canvasEl.addEventListener('pointerup', endDrag)
  canvasEl.addEventListener('pointercancel', endDrag)
  canvasEl.addEventListener('lostpointercapture', endDrag)

  // Init
  memeCanvas.setOverlays(overlays)
  memeCanvas.draw()
  setStatus('Ready. Upload an image or choose a random template.')
  syncFormFromState()
  renderLayers()

  // Avoid memory leaks if user navigates away
  window.addEventListener('beforeunload', () => {
    if (revokeCurrentImage) revokeCurrentImage()
  })

  return {
    memeCanvas,
  }
}

