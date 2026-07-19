const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// ---------- Persistence ----------
const storePath = path.join(app.getPath('userData'), 'notes.json');

function loadNotes() {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data.notes)) return data;
  } catch (_) {}
  return { notes: [] };
}

function saveNotes() {
  const notes = [];
  for (const [id, win] of noteWindows) {
    if (win.isDestroyed()) continue;
    const [x, y] = win.getPosition();
    const [width, height] = win.getSize();
    notes.push({
      id,
      x, y, width, height,
      text: noteState.get(id)?.text ?? '',
      color: noteState.get(id)?.color ?? 'yellow',
      opacity: noteState.get(id)?.opacity ?? 0.85,
      fontSize: noteState.get(id)?.fontSize ?? 15,
      ghost: noteState.get(id)?.ghost ?? false
    });
  }
  try {
    fs.writeFileSync(storePath, JSON.stringify({ notes }, null, 2));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

// ---------- Window management ----------
const noteWindows = new Map(); // id -> BrowserWindow
const noteState = new Map();   // id -> { text, color, opacity, fontSize }
let notesHidden = false;
let tray = null;

function nextId() {
  return 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

function createNoteWindow(note) {
  const id = note.id || nextId();

  const win = new BrowserWindow({
    width: note.width || 300,
    height: note.height || 220,
    x: note.x,
    y: note.y,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    minWidth: 160,
    minHeight: 120,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // The magic: exclude this window from screen capture / sharing / recording.
  win.setContentProtection(true);

  // Float above everything, including fullscreen apps you may be sharing.
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreenSpaces: true });

  noteWindows.set(id, win);
  noteState.set(id, {
    text: note.text || '',
    color: note.color || 'yellow',
    opacity: typeof note.opacity === 'number' ? note.opacity : 0.85,
    fontSize: note.fontSize || 15,
    ghost: !!note.ghost
  });

  win.loadFile('note.html', { query: { id } });

  win.on('closed', () => {
    noteWindows.delete(id);
    noteState.delete(id);
    saveNotes();
  });

  win.on('moved', saveNotes);
  win.on('resized', saveNotes);

  return id;
}

function createNoteNearCursor() {
  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const wa = display.workArea;
  // Cascade a little so stacked notes don't perfectly overlap.
  const offset = (noteWindows.size % 6) * 26;
  const x = Math.min(cursor.x, wa.x + wa.width - 320) + offset;
  const y = Math.min(cursor.y, wa.y + wa.height - 240) + offset;
  const id = createNoteWindow({ x, y });
  saveNotes();
  return id;
}

function toggleHideAll() {
  notesHidden = !notesHidden;
  for (const win of noteWindows.values()) {
    if (win.isDestroyed()) continue;
    if (notesHidden) win.hide();
    else win.showInactive();
  }
  updateTrayMenu();
}

function showAll() {
  notesHidden = false;
  for (const win of noteWindows.values()) {
    if (!win.isDestroyed()) win.showInactive();
  }
  updateTrayMenu();
}

// ---------- IPC from renderer ----------
ipcMain.on('note:update', (e, { id, text, color, opacity, fontSize, ghost }) => {
  const state = noteState.get(id);
  if (!state) return;
  if (typeof text === 'string') state.text = text;
  if (color) state.color = color;
  if (typeof opacity === 'number') state.opacity = opacity;
  if (typeof fontSize === 'number') state.fontSize = fontSize;
  if (typeof ghost === 'boolean') state.ghost = ghost;
  saveNotes();
});

// Toggle whether a note lets clicks pass through to whatever is behind it.
// forward:true keeps mouse-move events flowing so the renderer can re-enable
// interaction over the toolbar.
ipcMain.on('note:setIgnoreMouse', (e, { id, ignore }) => {
  const win = noteWindows.get(id);
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(ignore, { forward: true });
});

function toggleGhostAll() {
  for (const win of noteWindows.values()) {
    if (!win.isDestroyed()) win.webContents.send('note:toggleGhost');
  }
}

ipcMain.handle('note:getState', (e, id) => noteState.get(id) || null);

ipcMain.on('note:close', (e, id) => {
  const win = noteWindows.get(id);
  if (win && !win.isDestroyed()) win.close();
});

ipcMain.on('note:new', () => createNoteNearCursor());

// ---------- Tray ----------
function buildTrayIcon() {
  // A simple template icon drawn from a data URL (small note glyph).
  const img = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAT0lEQVR4nGNgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFAAAqvAB/6mL1w0AAAAASUVORK5CYII='
  );
  img.setTemplateImage(true);
  return img;
}

function updateTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: 'New Note', accelerator: 'CmdOrCtrl+Shift+N', click: () => createNoteNearCursor() },
    {
      label: notesHidden ? 'Show All Notes' : 'Hide All Notes',
      accelerator: 'CmdOrCtrl+Shift+H',
      click: () => toggleHideAll()
    },
    {
      label: 'Toggle Click-Through (all)',
      accelerator: 'CmdOrCtrl+Shift+G',
      click: () => toggleGhostAll()
    },
    { type: 'separator' },
    { label: 'Notes are invisible to screen sharing ✓', enabled: false },
    { type: 'separator' },
    { label: 'Quit Invisible Notes', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
}

function setupTray() {
  tray = new Tray(buildTrayIcon());
  tray.setToolTip('Invisible Notes');
  updateTrayMenu();
  tray.on('click', () => tray.popUpContextMenu());
}

// ---------- App lifecycle ----------
app.whenReady().then(() => {
  // Hide from the Dock — this is a background utility.
  if (app.dock) app.dock.hide();

  setupTray();

  const data = loadNotes();
  if (data.notes.length === 0) {
    createNoteNearCursor();
  } else {
    for (const note of data.notes) createNoteWindow(note);
  }

  globalShortcut.register('CommandOrControl+Shift+N', () => createNoteNearCursor());
  globalShortcut.register('CommandOrControl+Shift+H', () => toggleHideAll());
  globalShortcut.register('CommandOrControl+Shift+G', () => toggleGhostAll());
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Keep running with no visible windows (tray app).
app.on('window-all-closed', (e) => {
  // Do not quit; user manages lifecycle via tray.
});
