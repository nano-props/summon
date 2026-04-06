export interface WindowDTO {
  id: string
  title: string
  cwd: string
  tabCount: number
  alias: string
}

export interface WindowsResponse {
  version: string
  windows: WindowDTO[]
}

export interface SummonAPI {
  getWindows: () => Promise<WindowsResponse>
  activateWindow: (id: string) => Promise<{ ok: boolean }>
  saveAlias: (id: string, alias: string) => Promise<{ ok: boolean }>
  reorderWindows: (orderedIds: string[]) => Promise<{ ok: boolean }>
  newTerminal: () => Promise<{ ok: boolean }>
  hidePanel: () => Promise<void>
  quit: () => Promise<void>
}

declare global {
  interface Window {
    summonAPI: SummonAPI
  }
}
