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
./install.sh
```

Builds a host-architecture `.app` and installs it to `~/Applications`.

## Develop

```bash
bun install
bun run dev
```
