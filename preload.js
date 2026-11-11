const { contextBridge, ipcRenderer, webUtils } = require('electron');

function bindChannel(channel, cb) {
  ipcRenderer.removeAllListeners(channel);
  ipcRenderer.on(channel, (_e, data) => cb(data));
}

contextBridge.exposeInMainWorld('notchApi', {
  setMouseInteractive: (interactive) => ipcRenderer.send('notch:mouse-interactive', Boolean(interactive)),
  setExpandedState: (expanded) => ipcRenderer.send('notch:expanded-state', Boolean(expanded)),
  updateShape: (rect) => ipcRenderer.send('notch:update-shape', rect),
  setWindowShape: (rect) => ipcRenderer.send('notch:update-shape', rect),
  mediaAction: (action, payload) => ipcRenderer.send('notch:media-action', { action, payload }),
  setVolume: (pct) => ipcRenderer.send('notch:set-volume', pct),
  toggleMute: () => ipcRenderer.send('notch:toggle-mute'),
  volumeAction: (action, value) => {
    if (action === 'mute') ipcRenderer.send('notch:toggle-mute');
    else ipcRenderer.send('notch:set-volume', value);
  },
  saveConfig: (partial) => ipcRenderer.invoke('notch:save-config', partial),
  getState: () => ipcRenderer.invoke('notch:get-state'),
  refreshExternal: () => ipcRenderer.invoke('notch:refresh-external'),
  addShelfItem: (item) => ipcRenderer.invoke('notch:shelf-add', item),
  removeShelfItem: (id) => ipcRenderer.invoke('notch:shelf-remove', id),
  clearShelf: () => ipcRenderer.invoke('notch:shelf-clear'),
  openShelfFile: (filePath) => ipcRenderer.send('notch:shelf-open', filePath),
  revealShelfFile: (filePath) => ipcRenderer.send('notch:shelf-reveal', filePath),
  startShelfDrag: (filePath) => ipcRenderer.send('notch:shelf-drag', filePath),
  copyText: (text) => ipcRenderer.invoke('notch:copy-text', text),
  copyClipboard: (text) => ipcRenderer.invoke('notch:copy-text', text),
  readClipboardText: () => ipcRenderer.invoke('notch:read-clipboard'),
  readClipboard: () => ipcRenderer.invoke('notch:read-clipboard'),
  addLocalEvent: (ev) => ipcRenderer.invoke('notch:event-add', ev),
  removeLocalEvent: (id) => ipcRenderer.invoke('notch:event-remove', id),
  connectGoogleCalendar: () => ipcRenderer.invoke('notch:connect-gcal'),
  openExternalUrl: (url) => ipcRenderer.send('notch:open-external', url),
  notifySchedule: (payload) => ipcRenderer.invoke('notch:notify-schedule', payload),
  testWebhook: () => ipcRenderer.invoke('notch:test-webhook'),
  optimizeRam: () => ipcRenderer.send('notch:optimize-ram'),
  quitApp: () => ipcRenderer.send('notch:quit'),
  getPathForFile: (file) => {
    try { return webUtils.getPathForFile(file); } catch { return file?.path || ''; }
  },
  onMediaUpdate: (cb) => bindChannel('bridge:media', cb),
  onLyricsUpdate: (cb) => bindChannel('bridge:lyrics', cb),
  onVolumeUpdate: (cb) => bindChannel('bridge:volume', cb),
  onExternalUpdate: (cb) => bindChannel('bridge:external', cb),
  onPushToast: (cb) => bindChannel('bridge:toast', cb),
  onConfigUpdate: (cb) => bindChannel('bridge:config', cb),
  onShelfUpdate: (cb) => bindChannel('bridge:shelf', cb),
  onTopEdgeHover: (cb) => bindChannel('bridge:top-edge-hover', cb),
  onVisibilityToggle: (cb) => {
    ipcRenderer.removeAllListeners('bridge:toggle-visibility');
    ipcRenderer.on('bridge:toggle-visibility', () => cb());
  }
});
