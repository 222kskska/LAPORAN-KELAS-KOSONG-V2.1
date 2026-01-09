const { app, shell } = require('electron');
const path = require('path');
const express = require('express');

// __dirname is available in CommonJS, no need for fileURLToPath

const PORT = 1991; // Port custom seperti Dapodik
let serverInstance: any = null;

function startEmbeddedServer() {
  return new Promise((resolve, reject) => {
    try {
      const server = express();
      const isPackaged = app.isPackaged;
      
      // Tentukan folder dist
      const distPath = isPackaged 
        ? path.join(process.resourcesPath, 'dist')
        : path.join(__dirname, '../dist');
      
      console.log('📁 Serving from:', distPath);
      
      // Serve static files
      server.use(express.static(distPath));
      
      // Handle React routing
      server.get('*', (req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      
      // Start server
      serverInstance = server.listen(PORT, () => {
        console.log(`✅ Server started on http://localhost:${PORT}`);
        resolve(true);
      });
      
      serverInstance.on('error', (err: any) => {
        console.error('❌ Server error:', err);
        reject(err);
      });
      
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      reject(error);
    }
  });
}

async function openInBrowser() {
  const url = `http://localhost:${PORT}`;
  
  // Tunggu sebentar agar server siap
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Buka di browser default
  await shell.openExternal(url);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 SiswaConnect berhasil dijalankan!`);
  console.log(`📡 Server berjalan di: ${url}`);
  console.log(`🌐 Browser akan terbuka otomatis`);
  console.log(`\n💡 Informasi:`);
  console.log(`   ✓ Port: ${PORT}`);
  console.log(`   ✓ Akses lokal: http://localhost:${PORT}`);
  console.log(`   ✓ Status: Running`);
  console.log(`\n⚠️  Jangan tutup window ini - Server akan berhenti!`);
  console.log(`${'='.repeat(70)}\n`);
}

app.whenReady().then(async () => {
  try {
    console.log('🔄 Starting SiswaConnect...');
    await startEmbeddedServer();
    await openInBrowser();
  } catch (error) {
    console.error('❌ Error starting application:', error);
    app.quit();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('⚠️  Aplikasi sudah berjalan!');
  app.quit();
} else {
  app.on('second-instance', () => {
    // Jika user coba buka lagi, buka tab baru di browser
    console.log('📱 Membuka tab baru...');
    shell.openExternal(`http://localhost:${PORT}`);
  });
}

// Handle app quit
app.on('before-quit', () => {
  console.log('🛑 Stopping server...');
  if (serverInstance) {
    serverInstance.close();
  }
});

// Keep app running (no window mode)
app.on('window-all-closed', () => {
  // Don't quit - we're running as a background server
});
