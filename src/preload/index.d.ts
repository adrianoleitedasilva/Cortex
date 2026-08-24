import type { CortexApi } from './index'

declare global {
  interface Window {
    cortex: CortexApi
  }
}
