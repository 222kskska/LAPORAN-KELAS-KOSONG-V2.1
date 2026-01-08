# LAPORAN KELAS KOSONG V3 📚

A modern classroom attendance reporting system with **Multi-User MySQL Architecture**. Built to streamline the process of reporting empty classrooms and managing student attendance efficiently with centralized database and real-time collaboration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/mysql-5.7%2B-blue)](https://www.mysql.com/)

## 🚀 Multi-User Architecture (v3.0)

### What's New in V3?

- **Multi-User Support**: Multiple users can access simultaneously from different devices
- **Centralized Database**: MySQL database for data persistence and consistency
- **RESTful API Backend**: Node.js + Express + TypeScript server
- **JWT Authentication**: Secure token-based authentication
- **Real-time Updates**: Data synchronization across all connected clients
- **Production Ready**: Designed for school-wide deployment on LAN

### Architecture Overview

```
┌─────────────┐     HTTP REST API      ┌──────────────┐      MySQL       ┌──────────┐
│   Client    │ ──────────────────────> │    Server    │ ────────────────> │ Database │
│  (Browser)  │ <────────────────────── │ (Node.js +   │ <──────────────── │ (MySQL)  │
│  Port 1991  │      JSON Response      │   Express)   │      Result       │          │
└─────────────┘                         └──────────────┘                   └──────────┘
```

### Use Cases

- **School-wide Deployment**: Central server, multiple client access points
- **Real-time Collaboration**: Teachers and operators work simultaneously
- **Data Centralization**: All reports stored in one place
- **Multi-device Access**: Access from any PC/laptop on school network

## 🌟 Features

### Web Mode
- 📱 Responsive web interface accessible from any device
- 🔐 Secure authentication system with role-based access control
- 📊 Real-time classroom status monitoring
- 📝 Easy report submission for empty classrooms
- 📈 Analytics dashboard for administrators
- 🔔 Notification system for important updates
- 📄 Export reports to PDF/Excel formats
- 🌐 Multi-language support

### Desktop Mode
- 💻 Native desktop application for Windows
- ⚡ Faster performance with offline capabilities
- 🔄 Auto-sync when connection is available
- 🖥️ System tray integration
- 📦 Standalone executable - no installation required
- 🎨 Native OS integration and notifications

### Common Features
- 👥 User management (Students, Teachers, Administrators)
- 📅 Schedule management for classroom monitoring
- 🔍 Advanced search and filtering
- 📊 Comprehensive reporting system
- 🔒 Data encryption and security
- 🌙 Dark/Light theme support
- ♿ Accessibility features

## 🛠️ Technology Stack

### Frontend
- **React** ^18.0.0 - UI library
- **TypeScript** - Type safety
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - UI styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend (NEW in v3.0)
- **Node.js** ^16.0.0 - Runtime environment
- **Express** ^4.18 - Web framework
- **TypeScript** - Type safety
- **MySQL2** - MySQL client with connection pooling
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Helmet** - Security headers
- **Morgan** - HTTP request logging

### Database (NEW in v3.0)
- **MySQL** 5.7+ / **MariaDB** 10.3+ - Relational database
- 8 normalized tables
- Foreign key constraints
- Optimized indexes

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **ts-node** - TypeScript execution
- **nodemon** - Auto-restart on changes

## 📦 Installation

### Prerequisites (v3.0)
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **MySQL Server** 5.7+ or MariaDB 10.3+
- **Git** (optional)

### Quick Start (Windows)

1. **Clone the repository**
```bash
git clone https://github.com/222kskska/LAPORAN-KELAS-KOSONG-V2.1.git
cd LAPORAN-KELAS-KOSONG-V2.1
```

2. **Run Automated Installers**
```cmd
cd installer
check-requirements.bat     # Verify prerequisites
setup-database.bat         # Setup MySQL database
setup-server.bat           # Setup backend server
```

3. **Start the Server**
```cmd
cd server
npm start
```

4. **Access the Application**
Open browser: `http://localhost:1991`

Default login:
- Username: `admin`
- Password: `password` (⚠️ Change after first login!)

### Manual Installation

#### 1. Database Setup

Install MySQL Server from https://dev.mysql.com/downloads/

```bash
# Import database schema
mysql -u root -p < database/schema.sql

# Import seed data
mysql -u root -p siswa_connect < database/seed.sql
```

#### 2. Backend Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run build
npm start
```

#### 3. Frontend Client

```bash
# Root directory
npm install
cp .env.example .env
# Edit .env with API URL (default: http://localhost:1991/api)
npm run dev
```

### Network Deployment

For multi-user access on LAN:

1. Get server IP: `ipconfig` (Windows) or `ifconfig` (Linux)
2. Configure firewall: `netsh advfirewall firewall add rule name="SiswaConnect" dir=in action=allow protocol=TCP localport=1991`
3. Update `server/.env`: `CLIENT_URL=http://192.168.1.100:1991`
4. Access from clients: `http://192.168.1.100:1991`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.
npm run dev
# or
yarn dev
```

5. **Access the application**
Open your browser and navigate to `http://localhost:3000`

### Desktop Mode Installation

1. **Follow steps 1-3 from Web Mode Installation**

2. **Install Electron dependencies**
```bash
npm install electron electron-builder --save-dev
# or
yarn add electron electron-builder --dev
```

3. **Start desktop application in development mode**
```bash
npm run electron:dev
# or
yarn electron:dev
```

4. **Build desktop executable**
```bash
# For Windows
npm run electron:build:win

# For macOS
npm run electron:build:mac

# For Linux
npm run electron:build:linux

# For all platforms
npm run electron:build
```

The built application will be available in the `dist` folder.

## 🔑 Demo Accounts

For testing purposes, you can use the following demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Administrator | admin@demo.com | admin123 | Full access to all features |
| Teacher | teacher@demo.com | teacher123 | Report submission, class management |
| Student | student@demo.com | student123 | View reports, submit attendance |

> **Note:** These are demo accounts for testing only. Change default credentials in production!

## 📁 Folder Structure

```
LAPORAN-KELAS-KOSONG-V2/
├── public/                 # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable components
│   │   ├── common/
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/             # Page components
│   │   ├── Dashboard/
│   │   ├── Reports/
│   │   ├── Login/
│   │   └── Settings/
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── context/           # Context providers
│   ├── store/             # Redux store (if using Redux)
│   ├── styles/            # Global styles
│   ├── electron/          # Electron main process files
│   │   ├── main.js
│   │   ├── preload.js
│   │   └── handlers/
│   ├── App.jsx
│   └── main.jsx
├── dist/                  # Built desktop applications
├── build/                 # Built web application
├── tests/                 # Test files
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js        # Vite configuration
├── electron-builder.json  # Electron builder config
└── README.md
```

## 🔧 Troubleshooting

### Common Errors and Solutions

#### 1. "exports is not defined" Error

**Problem:** This error typically occurs when using CommonJS modules in an ES6 environment or vice versa.

**Solutions:**

**Option A: Update vite.config.js**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
```

**Option B: Check package.json**
```json
{
  "type": "module",
  "main": "src/main.jsx"
}
```

**Option C: Update import statements**
```javascript
// Instead of
const module = require('module-name');

// Use
import module from 'module-name';
```

#### 2. Multiple SiswaConnect.exe Processes Running

**Problem:** Multiple instances of the desktop application are running simultaneously, causing conflicts.

**Solutions:**

**Option A: Implement Single Instance Lock (Recommended)**

Add to `src/electron/main.js`:
```javascript
const { app, BrowserWindow } = require('electron');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}
```

**Option B: Manually Close Processes**

Windows:
```bash
# Command Prompt
taskkill /F /IM SiswaConnect.exe

# PowerShell
Get-Process SiswaConnect | Stop-Process -Force
```

Linux/macOS:
```bash
pkill -9 SiswaConnect
```

**Option C: Task Manager**
1. Press `Ctrl + Shift + Esc` (Windows) or `Cmd + Option + Esc` (macOS)
2. Find all "SiswaConnect.exe" processes
3. Select and click "End Task" for each

#### 3. Port Already in Use

**Problem:** Development server can't start because port 3000 is already in use.

**Solution:**
```bash
# Find and kill the process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

#### 4. Module Not Found Errors

**Problem:** Dependencies are not installed properly.

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### 5. Electron App Won't Build

**Problem:** Electron builder fails during the build process.

**Solution:**
```bash
# Clear electron cache
npm run electron:clean

# Rebuild with verbose logging
npm run electron:build -- --verbose

# Check electron-builder.json configuration
```

#### 6. CORS Errors in Web Mode

**Problem:** API requests are blocked by CORS policy.

**Solution:**

Add proxy to `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start web development server with hot reload |
| `npm run build` | Build web application for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Automatically fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run electron:dev` | Start Electron app in development mode |
| `npm run electron:build` | Build Electron app for current platform |
| `npm run electron:build:win` | Build Electron app for Windows |
| `npm run electron:build:mac` | Build Electron app for macOS |
| `npm run electron:build:linux` | Build Electron app for Linux |
| `npm run electron:build:all` | Build Electron app for all platforms |
| `npm run electron:clean` | Clean Electron build cache |

### Custom Scripts Usage Examples

```bash
# Development
npm run dev                    # Start web app
npm run electron:dev           # Start desktop app

# Production Build
npm run build                  # Build web app
npm run electron:build:win     # Build Windows .exe

# Code Quality
npm run lint                   # Check for errors
npm run format                 # Format all files

# Testing
npm test                       # Run all tests
npm run test:coverage          # Check test coverage
```

## 🚀 Deployment

### Web Application Deployment

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

#### Deploy to GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"homepage": "https://arifwbo.github.io/LAPORAN-KELAS-KOSONG-V2",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### Desktop Application Distribution

#### Windows
1. Build the application: `npm run electron:build:win`
2. Find the installer in `dist/` folder
3. Distribute the `.exe` installer file
4. Optional: Sign the executable with a code signing certificate

#### macOS
1. Build the application: `npm run electron:build:mac`
2. Find the `.dmg` file in `dist/` folder
3. Optional: Notarize the app for macOS Gatekeeper

#### Linux
1. Build the application: `npm run electron:build:linux`
2. Find the `.AppImage` or `.deb` file in `dist/` folder
3. Distribute through package managers or direct download

### Auto-Update Configuration

Add to `electron-builder.json`:
```json
{
  "publish": [
    {
      "provider": "github",
      "owner": "arifwbo",
      "repo": "LAPORAN-KELAS-KOSONG-V2"
    }
  ]
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Commit with conventional commits**
```bash
git commit -m "feat: add amazing feature"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

5. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep PRs focused on a single feature/fix

### Code Review Process

1. Automated tests must pass
2. At least one maintainer approval required
3. No merge conflicts
4. Documentation updated if needed

### Reporting Bugs

Use GitHub Issues and include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

### Feature Requests

Open an issue with:
- Clear description of the feature
- Use cases
- Possible implementation approach
- Any relevant mockups or examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Credits

### Main Developer
- **Arif WBO** - [@arifwbo](https://github.com/arifwbo)

### Contributors
Thank you to all contributors who have helped improve this project!

### Special Thanks
- React team for the amazing framework
- Electron team for desktop capabilities
- All open-source library maintainers
- The education community for feedback and suggestions

### Third-Party Libraries
- [React](https://reactjs.org/) - UI Library
- [Electron](https://www.electronjs.org/) - Desktop Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [Material-UI](https://mui.com/) - Component Library
- [Axios](https://axios-http.com/) - HTTP Client
- [Chart.js](https://www.chartjs.org/) - Data Visualization

## 📞 Support

- 📧 Email: support@laporankelaskosong.com
- 🐛 Issues: [GitHub Issues](https://github.com/arifwbo/LAPORAN-KELAS-KOSONG-V2/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/arifwbo/LAPORAN-KELAS-KOSONG-V2/discussions)
- 📖 Documentation: [Wiki](https://github.com/arifwbo/LAPORAN-KELAS-KOSONG-V2/wiki)

## 🗺️ Roadmap

### Version 2.1 (Q1 2026)
- [ ] Mobile application (React Native)
- [ ] Advanced analytics with AI predictions
- [ ] Integration with popular LMS platforms
- [ ] Offline mode improvements

### Version 2.2 (Q2 2026)
- [ ] Multi-tenant support
- [ ] Custom branding options
- [ ] Advanced reporting templates
- [ ] API for third-party integrations

### Version 3.0 (Q3 2026)
- [ ] Complete redesign with modern UI/UX
- [ ] Microservices architecture
- [ ] Enhanced security features
- [ ] Performance optimizations

---

**Made with ❤️ by Arif WBO**

*Last Updated: December 24, 2025*