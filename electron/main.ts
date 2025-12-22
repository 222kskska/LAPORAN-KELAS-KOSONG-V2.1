import { app, BrowserWindow } from 'electron';
import path from 'path';

// Pada Electron Main process yang dicompile ke CommonJS, __dirname tersedia secara global.

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SiswaConnect",
    // icon: path.join(__dirname, '../dist/icon.ico'), // Aktifkan nanti jika sudah ada file icon.ico di folder public
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true, // Menyembunyikan menu bar agar terlihat seperti aplikasi native
  });

  // Dalam mode development, load dari Vite server
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Buka devtools untuk debug saat development
  } else {
    // Saat dipackage (exe), load file dari folder dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});