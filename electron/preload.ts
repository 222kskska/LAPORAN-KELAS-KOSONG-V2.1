import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // API khusus untuk komunikasi dengan main process
  // Contoh: membaca file lokal, notifikasi native, dll.
  platform: process.platform,
  isElectron: true
});
