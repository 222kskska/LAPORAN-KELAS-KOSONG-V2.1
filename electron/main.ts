import { app, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Untuk ES Module, kita perlu membuat __dirname sendiri
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5173; // Port default Vite
let serverProcess: any = null;

function startServer() {
  return new Promise((resolve) => {
    const isPackaged = app.isPackaged;
    
    if (!isPackaged) {
      // Development mode: Vite sudah jalan dengan npm run dev
      console.log('Development mode: Vite server should be running on port', PORT);
      resolve(true);
    } else {
      // Production mode: Start static file server
      try {
        const express = require('express');
        const serverApp = express();
        
        serverApp.use(express.static(path.join(__dirname, '../dist')));
        
        serverApp.get('*', (req: any, res: any) => {
          res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
        
        serverProcess = serverApp.listen(PORT, () => {
          console.log(`Server running on http://localhost:${PORT}`);
          resolve(true);
        });
      } catch (error) {
        console.error('Error starting server:', error);
        resolve(false);
      }
    }
  });
}

async function openInBrowser() {
  const url = `http://localhost:${PORT}`;
  
  // Tunggu sebentar agar server siap
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Buka di browser default (Chrome jika default browser adalah Chrome)
  shell.openExternal(url);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 SiswaConnect berhasil dijalankan!`);
  console.log(`📡 Server berjalan di: ${url}`);
  console.log(`🌐 Browser akan terbuka otomatis`);
  console.log(`\n💡 Tips:`);
  console.log(`   - Cek port di address bar: localhost:${PORT}`);
  console.log(`   - Tutup aplikasi ini untuk stop server`);
  console.log(`${'='.repeat(60)}\n`);
}

app.whenReady().then(async () => {
  try {
    await startServer();
    await openInBrowser();
  } catch (error) {
    console.error('Error starting application:', error);
    app.quit();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Jika user coba buka lagi, buka tab baru di browser
    shell.openExternal(`http://localhost:${PORT}`);
  });
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Tidak ada window, tapi tetap jalan sampai user quit dari console
});

// macOS specific
app.on('activate', () => {
  shell.openExternal(`http://localhost:${PORT}`);
});

// Cleanup on exit
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.close();
  }
});
