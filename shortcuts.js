// Global shortcuts. Kept in one place so accelerators are easy to audit
// for conflicts with common OS/app shortcuts (Cmd/Ctrl+Shift+N and +H are
// used by some browsers for private-window/history — Shift is included
// deliberately to reduce collisions, and registration failure is silent
// per Electron's design, so we log it instead of assuming success).
const { globalShortcut } = require('electron');

const BINDINGS = {
  newNote: 'CommandOrControl+Shift+N',
  toggleHideAll: 'CommandOrControl+Shift+H',
  toggleGhostAll: 'CommandOrControl+Shift+G',
  openManager: 'CommandOrControl+Shift+M'
};

function registerShortcuts(actions) {
  for (const [name, accelerator] of Object.entries(BINDINGS)) {
    const handler = actions[name];
    if (!handler) continue;
    const ok = globalShortcut.register(accelerator, handler);
    if (!ok) console.warn(`Shortcut ${accelerator} (${name}) could not be registered — likely in use by another app.`);
  }
}

function unregisterAll() {
  globalShortcut.unregisterAll();
}

module.exports = { registerShortcuts, unregisterAll, BINDINGS };
