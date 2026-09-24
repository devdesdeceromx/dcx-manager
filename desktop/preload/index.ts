import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('desktop', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  togglePin: () => ipcRenderer.invoke('window:toggle-pin') as Promise<boolean>,
  setCompact: (compact: boolean) => ipcRenderer.invoke('window:set-compact', compact) as Promise<boolean>,
})
