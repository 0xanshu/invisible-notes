const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notes', {
  update: (payload) => ipcRenderer.send('note:update', payload),
  getState: (id) => ipcRenderer.invoke('note:getState', id),
  close: (id) => ipcRenderer.send('note:close', id),
  newNote: () => ipcRenderer.send('note:new'),
  setIgnoreMouse: (id, ignore) => ipcRenderer.send('note:setIgnoreMouse', { id, ignore }),
  onToggleGhost: (cb) => ipcRenderer.on('note:toggleGhost', cb)
});
