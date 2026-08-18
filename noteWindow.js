// Builds the BrowserWindow for a single note record. Pure window-creation
// concerns live here; note *lifecycle* (what happens on move/resize/close)
// is wired by the caller via callbacks, so this module has no knowledge of
// the store.
const path = require('path');
const { BrowserWindow } = require('electron');
const platform = require('./platform');
const { clampToVisibleDisplay } = require('./displayUtils');

function createNoteWindow(record, { onMoved, onResized, onClosed } = {}) {
  const bounds = clampToVisibleDisplay(record);

  const win = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: false,
    skipTaskbar: true,
    minWidth: 160,
    minHeight: 120,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Exclude this window from screen capture / sharing / recording.
  // See platform.captureExclusionCaveat() for the Windows-version caveat.
  win.setContentProtection(true);
  platform.setPinned(win, record.pinned !== false);

  win.loadFile('note.html', { query: { id: record.id } });

  if (record.visible !== false) {
    win.once('ready-to-show', () => win.showInactive());
  }

  if (onMoved) win.on('moved', () => onMoved(win));
  if (onResized) win.on('resized', () => onResized(win));
  if (onClosed) win.on('closed', () => onClosed());

  return win;
}

module.exports = { createNoteWindow };
