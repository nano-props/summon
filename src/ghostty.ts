import { execFile } from 'node:child_process'

const BUNDLE_ID = 'com.mitchellh.ghostty'

export interface TerminalWindow {
  id: string
  title: string
  cwd: string
  tabCount: number
}

function runAppleScript(script: string, args: string[] = []): Promise<string | null> {
  return new Promise((resolve) => {
    execFile('/usr/bin/osascript', ['-e', script, ...args], (error, stdout, stderr) => {
      if (error) {
        console.error('AppleScript error:', error.message, stderr)
        resolve(null)
        return
      }
      resolve(stdout)
    })
  })
}

export async function listWindows(): Promise<TerminalWindow[]> {
  const script = `
    tell application "System Events"
      if not (exists (first process whose bundle identifier is "${BUNDLE_ID}")) then return ""
    end tell
    tell application id "${BUNDLE_ID}"
      set output to ""
      repeat with w in windows
        set wId to id of w
        set wTitle to name of w
        set tCount to count of tabs of w
        set cwd to ""
        try
          set cwd to working directory of focused terminal of selected tab of w
        end try
        set output to output & wId & "\t" & wTitle & "\t" & cwd & "\t" & tCount & "\n"
      end repeat
      return output
    end tell
  `

  const result = await runAppleScript(script)
  if (!result || !result.trim()) return []

  const windows: TerminalWindow[] = []
  for (const line of result.split('\n')) {
    const parts = line.split('\t')
    if (parts.length < 4) continue
    const id = parts[0].trim()
    const title = parts[1].trim()
    const cwd = parts[2].trim()
    const tabCount = parseInt(parts[3].trim(), 10) || 1
    if (id) {
      windows.push({ id, title, cwd, tabCount })
    }
  }
  return windows
}

export async function activateWindow(windowId: string): Promise<void> {
  const script = `
    on run argv
      set wId to item 1 of argv
      tell application id "${BUNDLE_ID}"
        activate
        activate window (first window whose id is wId)
      end tell
    end run
  `
  await runAppleScript(script, [windowId])
}

export async function newTerminal(): Promise<void> {
  const script = `
    tell application id "${BUNDLE_ID}"
      new window
      activate
    end tell
  `
  await runAppleScript(script)
}

