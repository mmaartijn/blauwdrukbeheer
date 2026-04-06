import { ref, computed } from 'vue'
import { SETTINGS_KEYS } from '@/constants/api'

/**
 * GitHub-authenticatie via de Device Auth Flow.
 *
 * GitHub's token-exchange-endpoint stuurt geen CORS-headers naar browsers.
 * Als de Device Flow mislukt door een CORS-fout, kan de gebruiker als
 * alternatief een Personal Access Token (PAT) invullen op de instellingenpagina.
 */
export function useGitHubAuth() {
  const token = ref(localStorage.getItem(SETTINGS_KEYS.GH_TOKEN) || null)
  const isAuthenticated = computed(() => !!token.value)

  // ── Device Auth Flow ───────────────────────────────────────────────────────

  async function startDeviceFlow(clientId) {
    const res = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, scope: 'repo' }),
    })
    if (!res.ok) throw new Error(`Device code aanvragen mislukt (${res.status})`)
    return res.json()
    // Geeft terug: { device_code, user_code, verification_uri, expires_in, interval }
  }

  /**
   * Poll totdat de gebruiker de code heeft ingevoerd.
   * Geeft de access_token terug, of gooit een Error bij mislukken/verlopen.
   */
  function pollForToken(clientId, deviceCode, intervalSecs) {
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          const res = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: clientId,
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
          })
          const data = await res.json()

          if (data.access_token) {
            clearInterval(timer)
            setToken(data.access_token)
            resolve(data.access_token)
          } else if (data.error === 'slow_down') {
            // interval verlengen – simpelweg huidige interval aanhouden volstaat
          } else if (data.error && data.error !== 'authorization_pending') {
            clearInterval(timer)
            reject(new Error(data.error_description || data.error))
          }
        } catch (e) {
          clearInterval(timer)
          reject(e)
        }
      }, intervalSecs * 1000)
    })
  }

  // ── Token beheer ───────────────────────────────────────────────────────────

  function setToken(t) {
    token.value = t
    localStorage.setItem(SETTINGS_KEYS.GH_TOKEN, t)
  }

  function setPatToken(pat) {
    setToken(pat.trim())
  }

  function logout() {
    token.value = null
    localStorage.removeItem(SETTINGS_KEYS.GH_TOKEN)
  }

  return { token, isAuthenticated, startDeviceFlow, pollForToken, setPatToken, logout }
}
