import type {
  CommandResult,
  PanelAnimationPhase,
  Prefs,
  SummonApi,
  WindowDto,
  WindowsState,
} from '#/src/shared/contracts.ts'

function api(): SummonApi {
  return (window as unknown as { summonAPI: SummonApi }).summonAPI
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function runCommand(label: string, command: () => Promise<CommandResult | null>): Promise<CommandResult> {
  try {
    const result = await command()
    if (!result) return { ok: false, error: `${label} failed` }
    if (!result.ok) console.error(`${label} failed:`, result.error ?? 'unknown error')
    return result
  } catch (error) {
    const message = errorMessage(error)
    console.error(`${label} failed:`, message)
    return { ok: false, error: message }
  }
}

export const summonClient = {
  getWindows: (): Promise<WindowsState | null> => api().getWindows(),
  getPrefs: (): Promise<Prefs | null> => api().getPrefs(),
  onWindowsChanged: (callback: (state: WindowsState) => void): (() => void) => api().onWindowsChanged(callback),
  onPrefsChanged: (callback: (prefs: Prefs) => void): (() => void) => api().onPrefsChanged(callback),
  onPanelAnimation: (callback: (phase: PanelAnimationPhase) => void): (() => void) => api().onPanelAnimation(callback),
  activateWindow: (targetWindow: WindowDto): Promise<CommandResult> =>
    runCommand('Activate', () => api().activateWindow(targetWindow.id, targetWindow.terminalId)),
  newTerminal: (): Promise<CommandResult> => runCommand('New terminal', () => api().newTerminal()),
  hidePanel: (): Promise<CommandResult> => runCommand('Hide panel', () => api().hidePanel()),
}
