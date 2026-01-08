# SiswaConnect Deployment Guide

Complete guide for deploying SiswaConnect Multi-User System in a school environment.

## 📋 System Requirements

### Server PC (Central Server)

**Minimum:**
- CPU: Intel Core i3 / AMD Ryzen 3
- RAM: 4GB
- Storage: 20GB free space
- OS: Windows 10/11, Ubuntu 20.04+
- Network: Ethernet connection (recommended)

**Recommended:**
- CPU: Intel Core i5 / AMD Ryzen 5
- RAM: 8GB
- Storage: 50GB SSD
- OS: Windows 10/11 Pro, Windows Server, Ubuntu Server
- Network: Gigabit Ethernet

### Client PCs

- Any PC/Laptop with modern web browser (Chrome, Firefox, Edge)
- Network connection to server
- No special software required

### Software Requirements (Server)

- **MySQL Server** 5.7+ or MariaDB 10.3+
- **Node.js** 16.x or higher
- **npm** 8.x or higher

## 🚀 Quick Deployment (Windows)

### 1. Prepare Server PC

1. Install MySQL Server: https://dev.mysql.com/downloads/
2. Install Node.js LTS: https://nodejs.org/
3. Clone/extract repository to server

### 2. Run Automated Installers

```cmd
cd installer
check-requirements.bat    # Verify prerequisites
setup-database.bat        # Setup database
setup-server.bat          # Setup backend
```

### 3. Configure Network

Get server IP:
```cmd
ipconfig
```

Configure firewall:
```cmd
netsh advfirewall firewall add rule name="SiswaConnect" dir=in action=allow protocol=TCP localport=1991
```

Update `server/.env`:
```env
CLIENT_URL=http://192.168.1.100:1991
```

### 4. Start Server

```cmd
cd server
npm start
```

### 5. Access from Clients

Open browser to: `http://192.168.1.100:1991`

Login with default credentials (change after first login!):
- Username: `admin` / Password: `password`

## 📖 Detailed Deployment

### Phase 1: Server Setup

#### 1.1 MySQL Installation

**Windows:**
1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Choose "Developer Default" or "Server only"
3. Set root password during installation
4. Start MySQL service

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### 1.2 Node.js Installation

**Windows:**
1. Download from https://nodejs.org/
2. Run installer (includes npm)
3. Verify: `node --version` and `npm --version`

**Linux (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### 1.3 Application Files

Extract or clone repository:
```cmd
git clone https://github.com/your-org/LAPORAN-KELAS-KOSONG-V2.1
cd LAPORAN-KELAS-KOSONG-V2.1
```

### Phase 2: Database Setup

#### 2.1 Create Database

**Using Installer (Recommended):**
```cmd
cd installer
setup-database.bat
```

**Manual Setup:**
```cmd
mysql -u root -p
```

```sql
source database/schema.sql
USE siswa_connect;
source database/seed.sql
```

#### 2.2 Verify Database

```sql
USE siswa_connect;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM teachers;
```

Expected: 9 tables, 6 users, 15 teachers

### Phase 3: Backend Configuration

#### 3.1 Install Dependencies

```cmd
cd server
npm install
```

#### 3.2 Configure Environment

Copy and edit `.env`:
```cmd
copy .env.example .env
notepad .env
```

**Critical Settings:**
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=siswa_connect

# Server
PORT=1991
NODE_ENV=production

# Security (MUST CHANGE)
JWT_SECRET=replace-with-32-char-random-string

# Network
CLIENT_URL=http://192.168.1.100:1991
```

Generate secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3.3 Build & Test

```cmd
npm run build
npm start
```

Test API:
```cmd
curl http://localhost:1991/api/health
```

Expected: `{"success":true,"message":"Server is running"}`

### Phase 4: Network Configuration

#### 4.1 Static IP (Recommended)

Set static IP on server:
- Windows: Network Settings → Change Adapter Options → IPv4 Properties
- Example: IP=192.168.1.100, Subnet=255.255.255.0, Gateway=192.168.1.1

#### 4.2 Firewall Rules

**Windows:**
```cmd
netsh advfirewall firewall add rule name="SiswaConnect Port 1991" dir=in action=allow protocol=TCP localport=1991
```

**Linux:**
```bash
sudo ufw allow 1991/tcp
sudo ufw reload
```

#### 4.3 Router Configuration (Optional)

For internet access:
1. Login to router admin
2. Setup port forwarding: External 1991 → Internal 192.168.1.100:1991
3. Note public IP for remote access

### Phase 5: Frontend Access

#### 5.1 Client Configuration

Clients access via browser:
```
http://192.168.1.100:1991
```

#### 5.2 Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

#### 5.3 Mobile Access

Same URL works on mobile browsers.

### Phase 6: Production Hardening

#### 6.1 Change Default Passwords

Login as each user and change password:
1. superadmin
2. admin
3. operator
4. All teacher accounts

#### 6.2 Update JWT Secret

Edit `server/.env`:
```env
JWT_SECRET=generate-new-32-plus-character-secret
```

Restart server after change.

#### 6.3 Database User

Create dedicated database user:
```sql
CREATE USER 'siswa_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON siswa_connect.* TO 'siswa_app'@'localhost';
FLUSH PRIVILEGES;
```

Update `.env`:
```env
DB_USER=siswa_app
DB_PASSWORD=strong_password
```

#### 6.4 SSL/HTTPS (Advanced)

Use reverse proxy (Nginx) for HTTPS:

Install Nginx, configure:
```nginx
server {
    listen 80;
    server_name siswaconnect.school.id;
    
    location / {
        proxy_pass http://localhost:1991;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Add SSL certificate (Let's Encrypt).

### Phase 7: Backup Strategy

#### 7.1 Database Backup

**Daily Backup Script** (`backup.bat`):
```bat
@echo off
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%
mysqldump -u root -pYOUR_PASSWORD siswa_connect > "backups\siswa_connect_%TIMESTAMP%.sql"
```

Schedule with Task Scheduler (daily at 2 AM).

#### 7.2 Backup Files

Also backup:
- `server/.env`
- `database/` directory
- Uploaded files (if any)

### Phase 8: Monitoring

#### 8.1 Process Manager (PM2)

Install PM2 for auto-restart:
```bash
npm install -g pm2
cd server
pm2 start dist/server.js --name siswaconnect
pm2 startup
pm2 save
```

Monitor:
```bash
pm2 status
pm2 logs siswaconnect
pm2 monit
```

#### 8.2 Activity Logs

Review regularly:
```sql
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100;
```

#### 8.3 Health Check

Create monitoring script (`check.bat`):
```bat
curl http://localhost:1991/api/health
if %errorlevel% NEQ 0 (
    echo Server is down!
    REM Send alert
)
```

## 🔧 Maintenance

### Regular Tasks

**Daily:**
- Check server is running
- Review activity logs for anomalies

**Weekly:**
- Database backup verification
- Check disk space

**Monthly:**
- Update dependencies: `npm update`
- Review user accounts
- Database optimization: `OPTIMIZE TABLE`

### Updates

To update application:
```cmd
git pull
cd server
npm install
npm run build
pm2 restart siswaconnect
```

## 📞 Troubleshooting

See `TROUBLESHOOTING.md` for common issues.

Quick checks:
1. Is MySQL running? `sc query MySQL`
2. Is server running? `pm2 status`
3. Can clients reach server? `ping 192.168.1.100`
4. Check firewall: `netsh advfirewall show allprofiles`
5. Review logs: `pm2 logs` or check console

## 📊 Performance Optimization

### For 50+ Concurrent Users

1. **Increase MySQL connections:**
   ```sql
   SET GLOBAL max_connections = 200;
   ```

2. **Node.js clustering** (server.ts):
   ```typescript
   import cluster from 'cluster';
   import os from 'os';
   
   if (cluster.isPrimary) {
       for (let i = 0; i < os.cpus().length; i++) {
           cluster.fork();
       }
   } else {
       // Start server
   }
   ```

3. **Add Redis caching** (future enhancement)

### Database Indexing

Already optimized in schema, but can add more:
```sql
CREATE INDEX idx_reports_tanggal_kelas ON reports(tanggal, kelas);
CREATE INDEX idx_teacher_leaves_dates ON teacher_leaves(tanggal_mulai, tanggal_selesai);
```

## 🌐 Multi-School Deployment

For multiple schools sharing infrastructure:

1. **Database per school:**
   - `siswa_connect_school1`
   - `siswa_connect_school2`

2. **Server instance per school:**
   - Port 1991, 1992, 1993, etc.

3. **Or use multi-tenancy:**
   - Add `school_id` to all tables
   - Filter by school in queries

## 📝 Checklist

Pre-deployment:
- [ ] MySQL installed and configured
- [ ] Node.js installed
- [ ] Database created and seeded
- [ ] Server built successfully
- [ ] .env configured with secure secrets
- [ ] Static IP set on server
- [ ] Firewall rules added
- [ ] Default passwords changed
- [ ] Backup script configured

Post-deployment:
- [ ] Clients can access server
- [ ] Login works for all roles
- [ ] Report submission works
- [ ] Teacher leave works
- [ ] Admin functions work
- [ ] Backup tested
- [ ] PM2 auto-start configured

---

**Deployment Guide Version:** 3.0.0  
**Last Updated:** January 2026  
**For:** SiswaConnect Multi-User System
