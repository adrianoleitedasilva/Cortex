import { app, session } from 'electron'
import { settingsStore } from '../settings/store'

function buildCsp(): string {
  const allowRemoteImages = settingsStore.get('allowRemoteImages')
  const imgSrc = allowRemoteImages
    ? "img-src 'self' cortex-attachment: data: https: http:"
    : "img-src 'self' cortex-attachment: data:"

  // Vite's dev server injects an inline <script> (the React Fast Refresh preamble) that a
  // strict script-src blocks — silently breaking the whole app (blank page), since every
  // component module calls the now-undefined $RefreshReg$/$RefreshSig$ globals it sets up.
  // Production builds have no such inline script, so only relax this in dev.
  const scriptSrc = isDevServer() ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'"

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    imgSrc,
    "font-src 'self' data:",
    "connect-src 'self' ws://localhost:* http://localhost:*"
  ].join('; ')
}

function isDevServer(): boolean {
  return !app.isPackaged && !!process.env['ELECTRON_RENDERER_URL']
}

/** Injects CSP as a response header on the main document request (not per sub-resource),
 * read fresh from settings on every navigation — so toggling "load remote images" takes
 * effect immediately, without a reload. A <meta> CSP tag can't do this: once parsed, it can
 * only be tightened at runtime, never relaxed. */
export function registerCsp(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.resourceType !== 'mainFrame') {
      callback({ responseHeaders: details.responseHeaders })
      return
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [buildCsp()]
      }
    })
  })
}
