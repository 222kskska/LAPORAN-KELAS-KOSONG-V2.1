# SiswaConnect Installation Scripts

Automated installation scripts for setting up SiswaConnect Multi-User System on Windows.

## 📋 Overview

These scripts automate the setup process for:
1. System requirements verification
2. Database creation and seeding
3. Backend server installation and configuration

## 🛠️ Scripts

### 1. check-requirements.bat

**Purpose:** Verify that all required software is installed.

**Checks:**
- MySQL Server installation and service status
- Node.js version (minimum 16.x)
- npm availability

**Usage:**
```cmd
cd installer
check-requirements.bat
```

**Expected Output:**
```
✓ MySQL is installed
✓ MySQL service is RUNNING
✓ Node.js is installed (v18.17.0)
✓ npm is installed (9.6.7)
```

---

### 2. setup-database.bat

**Purpose:** Create and populate the MySQL database.

**What it does:**
1. Checks MySQL installation
2. Prompts for MySQL credentials
3. Tests database connection
4. Creates `siswa_connect` database
5. Imports schema (8 tables)
6. Imports seed data (6 users, 15 teachers, 12 classes, etc.)
7. Verifies installation

**Usage:**
```cmd
cd installer
setup-database.bat
```

**Interactive Prompts:**
```
MySQL Username (default: root): root
MySQL Password: ********
```

**Expected Output:**
```
✓ MySQL connection successful
✓ Schema imported successfully
✓ Seed data imported successfully
✓ Database verified successfully
```

**Default Login Credentials:**
| Username | Password | Role |
|----------|----------|------|
| superadmin | password | Super Admin |
| admin | password | Admin |
| operator | password | Operator |
| guru1 | password | Teacher |
| guru2 | password | Teacher |
| guru3 | password | Teacher |

⚠️ **Change these passwords after first login!**

---

### 3. setup-server.bat

**Purpose:** Install and configure the backend server.

**What it does:**
1. Checks Node.js and npm installation
2. Navigates to server directory
3. Installs npm dependencies
4. Creates `.env` file from template
5. Opens `.env` for configuration
6. Builds TypeScript code
7. Optionally starts the server

**Usage:**
```cmd
cd installer
setup-server.bat
```

**Expected Output:**
```
✓ Node.js found: v18.17.0
✓ npm found: 9.6.7
✓ Dependencies installed successfully
✓ Created .env file from template
✓ TypeScript build successful
```

**Configuration (.env):**
The script will open Notepad to edit `.env`. Configure:
- `DB_PASSWORD` - Your MySQL password
- `JWT_SECRET` - Change to a secure random string (min 32 chars)
- Other settings as needed

---

## 📖 Complete Installation Guide

### Step 1: Prerequisites

1. **Install MySQL Server**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - During installation, set a root password
   - Start MySQL service

2. **Install Node.js**
   - Download LTS version from: https://nodejs.org/
   - Minimum version: 16.x
   - npm will be installed automatically

3. **Clone/Extract Repository**
   ```cmd
   git clone https://github.com/your-repo/LAPORAN-KELAS-KOSONG-V2.1
   cd LAPORAN-KELAS-KOSONG-V2.1
   ```

### Step 2: Verify Requirements

```cmd
cd installer
check-requirements.bat
```

Install any missing software before proceeding.

### Step 3: Setup Database

```cmd
setup-database.bat
```

Enter your MySQL credentials when prompted. The script will create and populate the database.

### Step 4: Setup Server

```cmd
setup-server.bat
```

The script will:
1. Install dependencies (may take 2-5 minutes)
2. Open `.env` file for editing
3. Build the TypeScript code
4. Ask if you want to start the server now

**Important .env Settings:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=siswa_connect

PORT=1991
NODE_ENV=production

JWT_SECRET=change-this-to-a-long-random-string-min-32-characters

CLIENT_URL=http://localhost:1991
```

### Step 5: Start the Server

If you chose not to start during setup:

```cmd
cd ..\server
npm start
```

The server will start on port 1991.

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:1991
```

Login with one of the default accounts (see setup-database output).

---

## 🔧 Troubleshooting

### MySQL Connection Failed

**Error:** `Failed to connect to MySQL`

**Solutions:**
1. Verify MySQL service is running:
   ```cmd
   net start MySQL
   ```
   
2. Check credentials (username/password)

3. If service name is different:
   ```cmd
   sc query | findstr MySQL
   net start MySQL80  (or whatever the service name is)
   ```

### Node Modules Installation Failed

**Error:** `Failed to install dependencies`

**Solutions:**
1. Clear npm cache:
   ```cmd
   npm cache clean --force
   ```

2. Delete `node_modules` and try again:
   ```cmd
   cd server
   rmdir /s /q node_modules
   npm install
   ```

3. Check internet connection

### TypeScript Build Failed

**Error:** `Failed to build TypeScript`

**Solutions:**
1. Check Node.js version (should be 16+):
   ```cmd
   node --version
   ```

2. Reinstall dependencies:
   ```cmd
   npm install
   ```

3. Manual build:
   ```cmd
   cd server
   npx tsc
   ```

### Port 1991 Already in Use

**Error:** `EADDRINUSE: address already in use :::1991`

**Solutions:**
1. Find process using port:
   ```cmd
   netstat -ano | findstr :1991
   ```

2. Kill the process:
   ```cmd
   taskkill /PID <PID> /F
   ```

3. Or change port in `.env`:
   ```env
   PORT=3000
   ```

### Database Import Errors

**Error:** Syntax errors during import

**Solutions:**
1. Check MySQL version (should be 5.7+):
   ```cmd
   mysql --version
   ```

2. Try manual import:
   ```cmd
   mysql -u root -p < ..\database\schema.sql
   mysql -u root -p siswa_connect < ..\database\seed.sql
   ```

3. Check error.log file for details

---

## 🌐 Network Setup (For Multi-User Access)

To allow other computers on the network to access:

1. **Get Server IP Address:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Update .env:**
   ```env
   CLIENT_URL=http://192.168.1.100:1991
   ```

3. **Configure Windows Firewall:**
   ```cmd
   netsh advfirewall firewall add rule name="SiswaConnect" dir=in action=allow protocol=TCP localport=1991
   ```

4. **Restart Server**

5. **Access from Client PCs:**
   ```
   http://192.168.1.100:1991
   ```

---

## 📝 Uninstallation

### Remove Database

```cmd
mysql -u root -p -e "DROP DATABASE siswa_connect;"
```

### Remove Server Files

```cmd
cd server
rmdir /s /q node_modules
rmdir /s /q dist
del .env
```

---

## 🔄 Update/Reinstall

To reinstall or update:

1. **Backup Database (Optional):**
   ```cmd
   mysqldump -u root -p siswa_connect > backup.sql
   ```

2. **Re-run Setup Scripts:**
   ```cmd
   cd installer
   setup-database.bat
   setup-server.bat
   ```

---

## 📞 Support

For issues not covered here:
1. Check main documentation: `../docs/TROUBLESHOOTING.md`
2. Review server logs
3. Check database connectivity
4. Contact system administrator

---

**Version:** 3.0.0  
**Last Updated:** January 2026  
**Platform:** Windows 10/11  
**Author:** ArifWbo
