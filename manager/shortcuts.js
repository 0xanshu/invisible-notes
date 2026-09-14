// Shortcuts that apply while a Ghost Notes window is focused.
const platform = require("../platform");

// Shared shortcut list for matching, tray accelerators, and the in-app legend.
const SHORTCUTS = [
  {
    id: "newNote",
    scope: "app",
    accelerator: "CommandOrControl+Shift+N",
    label: "New note",
    description: "Drops a fresh note next to the cursor.",
  },
  {
    id: "openManager",
    scope: "app",
    accelerator: "CommandOrControl+Shift+M",
    label: "Notes Manager",
    description: "Every note you have saved, open or hidden.",
  },
  {
    id: "toggleHideAll",
    scope: "app",
    accelerator: "CommandOrControl+Shift+H",
    label: "Hide / show all notes",
    description:
      "Hiding keeps the contents — notes reopen exactly where they were.",
  },
  {
    id: "toggleGhostAll",
    scope: "app",
    accelerator: "CommandOrControl+Shift+G",
    label: "Toggle click-through",
    description:
      "Clicks pass straight through your notes. Hover a note bar to interact again.",
  },
  {
    id: "newNoteAnywhere",
    scope: "global",
    accelerator: "CommandOrControl+Alt+Shift+N",
    label: "New note from anywhere",
    description:
      "The only shortcut that works while another app has focus, so a new note is always reachable.",
  },
];

const APP_SHORTCUTS = SHORTCUTS.filter((shortcut) => shortcut.scope === "app");
const GLOBAL_SHORTCUT = SHORTCUTS.find(
  (shortcut) => shortcut.scope === "global",
);

const FALLBACK_BINDING = GLOBAL_SHORTCUT.accelerator;

const BINDINGS = Object.fromEntries(
  APP_SHORTCUTS.map((s) => [s.id, s.accelerator]),
);

function keyOf(accelerator) {
  const parts = accelerator.split("+");
  return parts[parts.length - 1];
}

const ACTION_BY_KEY = Object.fromEntries(
  APP_SHORTCUTS.map((s) => [keyOf(s.accelerator).toLowerCase(), s.id]),
);

const ACTION_BY_CODE = Object.fromEntries(
  APP_SHORTCUTS.map((s) => [`Key${keyOf(s.accelerator).toUpperCase()}`, s.id]),
);

function getShortcuts() {
  return SHORTCUTS.map((shortcut) => ({
    ...shortcut,
    display: platform.formatAccelerator(shortcut.accelerator),
  }));
}

function shortcutNameForInput(input) {
  if (!input || input.type !== "keyDown" || input.isAutoRepeat) return null;
  if (!platform.isCommandOrControlPressed(input) || !input.shift || input.alt)
    return null;
  if (input.code) return ACTION_BY_CODE[input.code] || null;
  return ACTION_BY_KEY[String(input.key || "").toLowerCase()] || null;
}

function registerShortcuts(win, actions) {
  win.webContents.on("before-input-event", (event, input) => {
    const name = shortcutNameForInput(input);
    const handler = name && actions[name];
    if (!handler) return;
    event.preventDefault();
    handler();
  });
}

function registerFallbackShortcut(globalShortcut, handler) {
  const registered = globalShortcut.register(FALLBACK_BINDING, handler);
  if (!registered) {
    console.warn(
      `Fallback shortcut ${FALLBACK_BINDING} could not be registered — likely in use by another app.`,
    );
  }
  return registered;
}

function unregisterFallbackShortcut(globalShortcut) {
  globalShortcut.unregister(FALLBACK_BINDING);
}

module.exports = {
  registerShortcuts,
  registerFallbackShortcut,
  unregisterFallbackShortcut,
  shortcutNameForInput,
  getShortcuts,
  BINDINGS,
  FALLBACK_BINDING,
};
