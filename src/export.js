function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ filename?: string }} [opts]
 */
export async function exportCanvasAsPng(canvas, opts = {}) {
  const filename = opts.filename ?? `meme_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`

  // Prefer toBlob (more memory-friendly than toDataURL)
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png')
  })

  if (blob) {
    downloadBlob(blob, filename)
    return
  }

  // Fallback
  const dataUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

