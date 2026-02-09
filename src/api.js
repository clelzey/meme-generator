const TEMPLATE_ENDPOINTS = [
  'https://api.memegen.link/templates/',
  'https://memegen.link/api/templates/',
]

let _templatesCache = null

/**
 * @typedef {{ id: string, name: string, blank: string, example?: string }} MemeTemplate
 */

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

/**
 * @returns {Promise<MemeTemplate[]>}
 */
export async function fetchTemplates() {
  if (_templatesCache) return _templatesCache

  let lastErr = null
  for (const url of TEMPLATE_ENDPOINTS) {
    try {
      const data = await fetchJson(url)
      if (!Array.isArray(data)) throw new Error('Unexpected API response')
      const cleaned = data.filter((t) => t && t.id && t.blank)
      if (!cleaned.length) throw new Error('No templates returned')
      _templatesCache = cleaned
      return cleaned
    } catch (err) {
      lastErr = err
    }
  }

  throw lastErr ?? new Error('Failed to fetch templates')
}

/**
 * @returns {Promise<MemeTemplate>}
 */
export async function getRandomTemplate() {
  const templates = await fetchTemplates()
  return templates[Math.floor(Math.random() * templates.length)]
}

/**
 * Fetch an image URL as a blob and return an object URL.
 * Using a blob helps keep the canvas exportable (avoids tainting) when CORS allows it.
 *
 * @param {string} url
 * @returns {Promise<{ objectUrl: string, revoke: () => void }>}
 */
export async function fetchImageObjectUrl(url) {
  const res = await fetch(url, { mode: 'cors', cache: 'no-store' })
  if (!res.ok) throw new Error(`Image request failed (${res.status})`)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  return { objectUrl, revoke: () => URL.revokeObjectURL(objectUrl) }
}

