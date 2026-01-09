const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// TypeScript type imports
import type { ChildProcess } from 'child_process';
import type { BrowserWindow as BrowserWindowType } from 'electron';

// Extend process type to include Electron's resourcesPath
interface ElectronProcess extends NodeJS.Process {
  resourcesPath: string;
}

interface AppConfig {
  installMode: 'standalone' | 'network';
  serverPort: number;
  dbType: 'sqlite' | 'mysql';
  dbConfig?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

const store = new Store();
let serverProcess: ChildProcess | null = null;
let mainWindow: BrowserWindowType | null = null;

// First-run setup wizard
async function showSetupWizard(): Promise<AppConfig> {
  return new Promise((resolve) => {
    const setupWindow = new BrowserWindow({
      width: 600,
      height: 550,
      resizable: false,
      center: true,
      title: 'SiswaConnect Setup Wizard',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const setupPath = app.isPackaged
      ? path.join((process as ElectronProcess).resourcesPath, 'electron', 'setup-wizard.html')
      : path.join(__dirname, 'setup-wizard.html');

    setupWindow.loadFile(setupPath);

    ipcMain.once('setup-complete', (_event: any, config: AppConfig) => {
      setupWindow.close();
      resolve(config);
    });

    setupWindow.on('closed', () => {
      // If window is closed without completing setup, use default standalone mode
      if (!store.get('config')) {
        resolve({
          installMode: 'standalone',
          serverPort: 1991,
          dbType: 'sqlite'
        });
      }
    });
  });
}

// Start backend server
async function startServer(config: AppConfig): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const isPackaged = app.isPackaged;
    
    // Determine server path
    const serverPath = isPackaged
      ? path.join((process as ElectronProcess).resourcesPath, 'server', 'dist', 'server.js')
      : path.join(__dirname, '../server/dist/server.js');
    
    // Determine Node.js path
    const nodePath = process.execPath; // Use Electron's built-in Node.js
    
    console.log('Server path:', serverPath);
    console.log('Node path:', nodePath);
    
    // Set environment variables
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PORT: config.serverPort.toString(),
      DB_TYPE: config.dbType,
      NODE_ENV: 'production',
      JWT_SECRET: 'siswaconnect-hybrid-jwt-secret-' + Date.now()
    };
    
    // Set MySQL configuration if network mode
    if (config.dbType === 'mysql' && config.dbConfig) {
      env.DB_HOST = config.dbConfig.host;
      env.DB_PORT = config.dbConfig.port.toString();
      env.DB_USER = config.dbConfig.user;
      env.DB_PASSWORD = config.dbConfig.password;
      env.DB_NAME = config.dbConfig.database;
    }
    
    console.log('Starting server with config:', {
      port: config.serverPort,
      dbType: config.dbType,
      mode: config.installMode
    });
    
    // Spawn server process
    serverProcess = spawn(nodePath, [serverPath], { 
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let serverReady = false;
    
    if (serverProcess) {
      serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(`[Server] ${output}`);
        
        if (output.includes('Server running') || output.includes('SISWACONNECT SERVER STARTED')) {
          serverReady = true;
          resolve(true);
        }
      });
      
      serverProcess.stderr?.on('data', (data) => {
        console.error(`[Server Error] ${data}`);
      });
      
      serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
        reject(error);
      });
      
      serverProcess.on('exit', (code, signal) => {
        console.log(`Server process exited with code ${code} and signal ${signal}`);
        if (!serverReady) {
          reject(new Error(`Server exited with code ${code}`));
        }
      });
    }
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        console.error('Server startup timeout');
        resolve(false);
      }
    }, 30000);
  });
}

// Create main window (opens browser)
async function openBrowser(port: number) {
  const { shell } = require('electron');
  const url = `http://localhost:${port}`;
  
  // Wait for server to be fully ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Open in default browser
  await shell.openExternal(url);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 SiswaConnect berhasil dijalankan!`);
  console.log(`📡 Server berjalan di: ${url}`);
  console.log(`🌐 Browser akan terbuka otomatis`);
  console.log(`\n💡 Informasi:`);
  console.log(`   ✓ Port: ${port}`);
  console.log(`   ✓ Akses lokal: ${url}`);
  console.log(`   ✓ Status: Running`);
  console.log(`\n⚠️  Jangan tutup aplikasi ini - Server akan berhenti!`);
  console.log(`${'='.repeat(70)}\n`);
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    let config = store.get('config');
    
    // First run - show setup wizard
    if (!config) {
      console.log('First run detected - showing setup wizard');
      config = await showSetupWizard();
      store.set('config', config);
      console.log('Configuration saved:', config);
    } else {
      console.log('Using existing configuration:', config);
    }
    
    // Start server
    console.log('Starting backend server...');
    const serverStarted = await startServer(config);
    
    if (!serverStarted) {
      dialog.showErrorBox(
        'Server Error', 
        'Failed to start server. Please check the configuration and try again.'
      );
      app.quit();
      return;
    }
    
    console.log('Server started successfully!');
    
    // Open browser
    await openBrowser(config.serverPort);
    
  } catch (error) {
    console.error('Startup error:', error);
    dialog.showErrorBox(
      'Startup Error', 
      'Failed to start application: ' + error
    );
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
    const config = store.get('config');
    if (config) {
      console.log('📱 Membuka tab baru...');
      const { shell } = require('electron');
      shell.openExternal(`http://localhost:${config.serverPort}`);
    }
  });
}

// Handle app quit
app.on('before-quit', () => {
  console.log('🛑 Stopping server...');
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Keep app running (no window mode)
app.on('window-all-closed', () => {
  // Don't quit - we're running as a background server
});

// Add menu for configuration reset
app.on('ready', () => {
  const { Menu } = require('electron');
  
  const template = [
    {
      label: 'SiswaConnect',
      submenu: [
        {
          label: 'Reset Configuration',
          click: async () => {
            const { response } = await dialog.showMessageBox({
              type: 'question',
              buttons: ['Cancel', 'Reset'],
              defaultId: 0,
              title: 'Reset Configuration',
              message: 'Are you sure you want to reset the configuration?',
              detail: 'This will restart the setup wizard on next launch.'
            });
            
            if (response === 1) {
              store.delete('config');
              dialog.showMessageBox({
                type: 'info',
                title: 'Configuration Reset',
                message: 'Configuration has been reset. Please restart the application.'
              });
              app.quit();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
});
