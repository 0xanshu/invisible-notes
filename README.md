# Invisible Notes

Translucent sticky notes that float on top of everything but stay **invisible to screen sharing and recording** (Zoom, Google Meet, QuickTime, OBS, macOS screen recording, etc.).

Perfect for demoing a take-home assignment or giving a code walkthrough while sharing your screen — keep your talking points on-screen with natural eye contact, and nobody watching the recording sees them.

## How it works

Each note is a frameless, transparent Electron window with `setContentProtection(true)`. On macOS that sets the window's capture-sharing type to *none*, so the OS excludes it from any screen capture while you still see it normally. The notes are always-on-top and stay visible even over fullscreen apps.

## Run

```bash
npm install
npm start
```

The app lives in the **menu bar** (no Dock icon). A note appears near your cursor on first launch.

## Usage

- **New note:** `Cmd+Shift+N` (or menu-bar icon → New Note, or the ＋ on a note)
- **Hide / show all notes:** `Cmd+Shift+H`
- **Move a note:** hover to reveal the top bar, then drag it
- **Resize:** drag any edge/corner
- **Color / opacity / text size:** controls in the hover bar
- **Close a note:** ✕ in the hover bar
- **Quit:** menu-bar icon → Quit

Notes (text, position, size, color, opacity) auto-save and reappear on next launch.

## Verify the invisibility

1. Start a screen recording (QuickTime → File → New Screen Recording) or a Zoom/Meet call with screen share.
2. The note stays visible on your screen but does **not** appear in the recording / to viewers.

> First time only: macOS may ask you to grant the app **Screen Recording** permission in System Settings → Privacy & Security. Content protection works regardless, but granting it avoids the OS prompt.

## Build a standalone .app

```bash
npm run dist
```

Produces a `.dmg` in `dist/` (uses electron-builder).
