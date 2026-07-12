# Summon

Summon is a macOS menu bar switcher for jumping between Ghostty windows.

Requires Ghostty.

## Core features

- Show open Ghostty windows with current directory, tab count, and Git repository context.
- Jump to a window by click, keyboard navigation, or ⌘1–⌘9.
- Create a new Ghostty window with ⌘N or from the menu bar.
- Toggle the panel with a configurable global shortcut.
- Switch appearance and UI language from the menu bar.

## Build & install (macOS)

```bash
./install.ts
```

Builds a host-architecture `.app` and installs it to `~/Applications`.

## Using a prebuilt download

After downloading the prebuilt app, move `Summon.app` to `~/Applications`.

Because the app is not signed, macOS may block it the first time you open it. If that happens, clear the quarantine flag once:

```bash
xattr -cr ~/Applications/Summon.app
```

Alternatively, open it via **Right-click → Open → Open**. See Apple's guide: <https://support.apple.com/guide/mac-help/mh40616/mac>.

## Develop

```bash
bun install
bun run dev
```
