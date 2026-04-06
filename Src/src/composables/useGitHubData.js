import { SETTINGS_KEYS } from '@/constants/api'

/**
 * Laag-niveau wrapper om de GitHub Contents API.
 * Leest owner/repo/token altijd vers uit localStorage zodat de service
 * ook buiten Vue-componenten (bijv. in Pinia stores) bruikbaar is.
 */
export function useGitHubData() {
  function settings() {
    return {
      owner: localStorage.getItem(SETTINGS_KEYS.GH_OWNER) || '',
      repo: localStorage.getItem(SETTINGS_KEYS.GH_REPO) || '',
      token: localStorage.getItem(SETTINGS_KEYS.GH_TOKEN) || '',
    }
  }

  function apiHeaders() {
    const { token } = settings()
    const headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  function repoBase() {
    const { owner, repo } = settings()
    return `https://api.github.com/repos/${owner}/${repo}`
  }

  // ── Bestanden lezen ────────────────────────────────────────────────────────

  /**
   * Haalt een bestand op via de GitHub Contents API.
   * Geeft { data: object, sha: string } terug.
   */
  async function fetchJsonFile(filePath, ref = null) {
    const url = new URL(`${repoBase()}/contents/${filePath}`)
    if (ref) url.searchParams.set('ref', ref)
    const res = await fetch(url.toString(), { headers: apiHeaders() })
    if (!res.ok) throw new Error(`GitHub API fout bij ${filePath}: ${res.status}`)
    const body = await res.json()
    // Content is base64-encoded inclusief newlines
    const decoded = JSON.parse(atob(body.content.replace(/\n/g, '')))
    return { data: decoded, sha: body.sha }
  }

  // ── Bestanden schrijven ───────────────────────────────────────────────────

  /**
   * Commit een JSON-bestand naar een branch via de GitHub Contents API.
   * sha is de huidige blob-SHA van het bestand op die branch (vereist door GitHub).
   */
  async function commitJsonFile(filePath, data, sha, branch, message) {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))
    const body = { message, content, branch, sha }
    const res = await fetch(`${repoBase()}/contents/${filePath}`, {
      method: 'PUT',
      headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Commit mislukt (${res.status})`)
    }
    return res.json()
  }

  // ── Branch beheer ─────────────────────────────────────────────────────────

  /**
   * Maakt een nieuwe branch aan op basis van de HEAD van main.
   * Geeft de SHA van de HEAD-commit terug.
   */
  async function createBranch(branchName) {
    const refRes = await fetch(`${repoBase()}/git/ref/heads/main`, { headers: apiHeaders() })
    if (!refRes.ok) throw new Error(`Ophalen van main HEAD mislukt (${refRes.status})`)
    const { object } = await refRes.json()

    const res = await fetch(`${repoBase()}/git/refs`, {
      method: 'POST',
      headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: object.sha }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Branch aanmaken mislukt (${res.status})`)
    }
    return object.sha
  }

  // ── Pull Request aanmaken ─────────────────────────────────────────────────

  async function createPR(title, body, headBranch) {
    const res = await fetch(`${repoBase()}/pulls`, {
      method: 'POST',
      headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, head: headBranch, base: 'main' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `PR aanmaken mislukt (${res.status})`)
    }
    return res.json() // bevat o.a. html_url
  }

  // ── SHA-check zonder content-download ────────────────────────────────────

  /**
   * Haalt de blob-SHA's van alle bestanden in de root van de repo op via de
   * Git Trees API (één lichte request, geen bestandsinhoud).
   * Geeft een object terug: { 'keywords.json': 'abc123', ... }
   */
  async function getTreeShas() {
    const res = await fetch(`${repoBase()}/git/trees/HEAD`, { headers: apiHeaders() })
    if (!res.ok) throw new Error(`Git tree ophalen mislukt (${res.status})`)
    const { tree } = await res.json()
    const shas = {}
    for (const item of tree) {
      if (item.type === 'blob') shas[item.path] = item.sha
    }
    return shas
  }

  return { settings, fetchJsonFile, commitJsonFile, createBranch, createPR, getTreeShas }
}
