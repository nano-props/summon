import { execa } from 'execa'

const BUNDLE_ID = 'com.mitchellh.ghostty'

export interface TerminalWindow {
  id: string
  terminalId: string
  title: string
  cwd: string
  tabCount: number
}

const FIELD_SEPARATOR = '\u001f'

async function runAppleScript(script: string, args: string[] = []): Promise<string> {
  const { stdout } = await execa('/usr/bin/osascript', ['-e', script, ...args], { timeout: 5000 })
  return stdout
}

export async function listWindows(): Promise<TerminalWindow[]> {
  const script = `
    tell application "System Events"
      if not (exists (first process whose bundle identifier is "${BUNDLE_ID}")) then return ""
    end tell
    tell application id "${BUNDLE_ID}"
      set sep to ASCII character 31
      set output to ""
      repeat with w in windows
        set wId to id of w
        set wTitle to name of w
        set tCount to count of tabs of w
        set terminalId to ""
        set cwd to ""
        try
          set focusedTerminal to focused terminal of selected tab of w
          set terminalId to id of focusedTerminal
          set cwd to working directory of focusedTerminal
        end try
        set output to output & wId & sep & terminalId & sep & wTitle & sep & cwd & sep & tCount & "\n"
      end repeat
      return output
    end tell
  `

  const result = await runAppleScript(script)
  if (!result || !result.trim()) return []

  const windows: TerminalWindow[] = []
  for (const line of result.split('\n')) {
    const parts = line.split(FIELD_SEPARATOR)
    if (parts.length < 5) continue
    const id = parts[0].trim()
    const terminalId = parts[1].trim()
    const title = parts[2].trim()
    const cwd = parts[3].trim()
    const tabCount = parseInt(parts[4].trim(), 10) || 1
    if (id) {
      windows.push({ id, terminalId, title, cwd, tabCount })
    }
  }
  return windows
}

export async function activateWindow(windowId: string, terminalId: string): Promise<void> {
  const script = `
    on run argv
      set wId to item 1 of argv
      set tId to item 2 of argv
      tell application id "${BUNDLE_ID}"
        activate
        if tId is not "" then
          try
            focus (terminal id tId of window id wId)
            return
          end try
        end if
        activate window (window id wId)
      end tell
    end run
  `
  await runAppleScript(script, [windowId, terminalId])
}

export async function newTerminal(): Promise<void> {
  // No explicit `activate` — Ghostty's `new window` handler already
  // calls NSApp.activate internally (TerminalController.swift), and
  // an extra activate makes macOS pull the user to whichever Space
  // already has a Ghostty window. See ghostty-org/ghostty#11457.
  const script = `
    tell application id "${BUNDLE_ID}"
      new window
    end tell
  `
  await runAppleScript(script)
}
