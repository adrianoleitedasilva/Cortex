import { protocol, net } from 'electron'
import { pathToFileURL } from 'url'
import { settingsStore } from '../settings/store'
import { resolveSafe } from '../vault/vaultManager'

export function registerAttachmentSchemePrivileges(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'cortex-attachment',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        corsEnabled: true
      }
    }
  ])
}

export function registerAttachmentProtocolHandler(): void {
  protocol.handle('cortex-attachment', async (request) => {
    const vaultRoot = settingsStore.get('currentVaultPath')
    if (!vaultRoot) {
      return new Response('Nenhum vault selecionado', { status: 404 })
    }

    const url = new URL(request.url)
    const relPath = decodeURIComponent(url.pathname.replace(/^\/+/, ''))

    try {
      const abs = resolveSafe(vaultRoot, relPath)
      return await net.fetch(pathToFileURL(abs).toString())
    } catch {
      return new Response('Não encontrado', { status: 404 })
    }
  })
}
