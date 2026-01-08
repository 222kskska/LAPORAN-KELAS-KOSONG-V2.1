# SiswaConnect Backend Server

Node.js + Express + TypeScript + MySQL backend server for SiswaConnect Multi-User System.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

- ✅ RESTful API with Express.js
- ✅ TypeScript for type safety
- ✅ MySQL database with connection pooling
- ✅ JWT-based authentication
- ✅ bcrypt password hashing
- ✅ Activity logging and audit trail
- ✅ CORS and security headers (Helmet)
- ✅ Request logging (Morgan)
- ✅ Transaction support for complex operations
- ✅ Comprehensive error handling

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: MySQL 5.7+ / MariaDB 10.3+
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **Database Client**: mysql2
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL Server 5.7+ or MariaDB 10.3+
- Database `siswa_connect` created and seeded

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
notepad .env  # Windows
nano .env     # Linux/Mac
```

### 3. Verify Database Connection

Make sure MySQL is running and the database is created:

```bash
mysql -u root -p

USE siswa_connect;
SHOW TABLES;
```

## Configuration

Edit `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=siswa_connect

# Server Configuration
PORT=1991
NODE_ENV=production

# JWT Configuration (min 32 characters recommended)
JWT_SECRET=change-this-to-a-very-long-random-secret-key-min-32-chars

# CORS Configuration
CLIENT_URL=http://localhost:1991

# Upload Configuration (5MB)
MAX_UPLOAD_SIZE=5242880
```

**Important:**
- Change `JWT_SECRET` to a strong random string
- Update `DB_PASSWORD` with your MySQL password
- Adjust `CLIENT_URL` for production (e.g., http://192.168.1.100:1991)

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start server
npm start
```

### Using Auto Installer (Windows)

```cmd
cd ..\installer
setup-server.bat
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/logout` | Logout (logging only) | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| POST | `/api/users` | Create new user | Yes |
| DELETE | `/api/users/:id` | Delete user | Yes |
| PATCH | `/api/users/:id/password` | Update password | Yes |

### Teachers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teachers` | Get all teachers | Yes |
| POST | `/api/teachers` | Create teacher | Yes |
| PUT | `/api/teachers/:id` | Update teacher | Yes |
| DELETE | `/api/teachers/:id` | Soft delete teacher | Yes |
| POST | `/api/teachers/bulk` | Bulk insert teachers | Yes |
| POST | `/api/teachers/bulk-delete` | Bulk delete teachers | Yes |

### Classes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/classes` | Get all classes | Yes |
| POST | `/api/classes` | Create class | Yes |
| PUT | `/api/classes/:id` | Update class | Yes |
| DELETE | `/api/classes/:id` | Soft delete class | Yes |
| POST | `/api/classes/bulk` | Bulk insert classes | Yes |
| POST | `/api/classes/bulk-delete` | Bulk delete classes | Yes |

### Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports` | Get all reports | Yes |
| POST | `/api/reports` | Create report | Yes |
| DELETE | `/api/reports/:id` | Delete report | Yes |
| POST | `/api/reports/bulk-delete` | Bulk delete reports | Yes |
| PATCH | `/api/reports/:id/status` | Update report status | Yes |

### Teacher Leaves

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teacher-leaves` | Get all leaves | Yes |
| GET | `/api/teacher-leaves?guru_id=X` | Get leaves for teacher | Yes |
| POST | `/api/teacher-leaves` | Create leave with assignments | Yes |
| PATCH | `/api/teacher-leaves/:id/approve` | Approve leave | Yes |
| PATCH | `/api/teacher-leaves/:id/reject` | Reject leave | Yes |
| PATCH | `/api/class-assignments/:id/notify` | Mark assignment notified | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server health check | No |

## Request/Response Examples

### Login

**Request:**
```bash
curl -X POST http://localhost:1991/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "admin",
    "role": "ADMIN",
    "name": "Admin Sekolah"
  }
}
```

### Get Teachers (Authenticated)

**Request:**
```bash
curl -X GET http://localhost:1991/api/teachers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Bpk. Joko Widodo",
      "mapel": "Matematika",
      "nip": "19610621 198503 1 001",
      "nuptk": "1234567890123456",
      "email": "joko.widodo@smpn4smr.sch.id",
      "phone": "081234567801"
    }
  ]
}
```

### Create Report

**Request:**
```bash
curl -X POST http://localhost:1991/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2026-01-08T10:00:00",
    "kelas": "IX-1",
    "guru": "Bpk. Joko Widodo",
    "waktu": "1-2",
    "keterangan": "Guru tidak hadir",
    "foto_base64": "data:image/jpeg;base64,/9j/4AAQ..."
  }'
```

## Development

### Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts        # Database connection pool
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication
│   └── server.ts              # Main server file with routes
├── dist/                      # Compiled JavaScript (generated)
├── .env                       # Environment variables (gitignored)
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Endpoints

1. Add route in `server.ts`:
```typescript
app.get('/api/new-endpoint', authenticateToken, async (req, res) => {
  try {
    const data = await query('SELECT * FROM table');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});
```

2. Test with curl or Postman
3. Document in README

### Database Queries

Use the `query` helper function:

```typescript
import { query } from './config/database';

// Simple query
const users = await query<RowDataPacket[]>('SELECT * FROM users');

// Parameterized query (prevents SQL injection)
const user = await query<RowDataPacket[]>(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// Insert
const result = await query<ResultSetHeader>(
  'INSERT INTO teachers (nama, mapel) VALUES (?, ?)',
  ['John Doe', 'Math']
);
console.log('Inserted ID:', result.insertId);
```

### Transactions

For operations that need to be atomic:

```typescript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  // Multiple operations
  await connection.execute('INSERT INTO ...');
  await connection.execute('UPDATE ...');
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

## Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Update database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configure firewall to allow port 1991
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure automated backups
- [ ] Set up monitoring and logging
- [ ] Update `CLIENT_URL` to production domain/IP

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start dist/server.js --name siswaconnect

# Auto-start on system boot
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs siswaconnect
pm2 monit

# Restart
pm2 restart siswaconnect
```

### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:1991;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Database Connection Failed

```
❌ Database connection failed: Error: connect ECONNREFUSED
```

**Solution:**
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`
- Check firewall settings

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::1991
```

**Solution:**
```bash
# Find process using port 1991
netstat -ano | findstr :1991  # Windows
lsof -i :1991                 # Linux/Mac

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### JWT Token Invalid

```
{ "success": false, "message": "Invalid or expired token" }
```

**Solution:**
- Token expired (24h limit) - login again
- `JWT_SECRET` changed - all tokens invalidated
- Malformed token - check Authorization header format: `Bearer TOKEN`

### TypeScript Compilation Errors

```
Error: Cannot find module 'X'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Permission Denied (MySQL)

```
Error: Access denied for user 'root'@'localhost'
```

**Solution:**
```sql
GRANT ALL PRIVILEGES ON siswa_connect.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Monitoring & Logs

### Activity Logs

All user actions are logged in the `activity_logs` table:

```sql
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50;
```

### Server Logs

Development mode shows detailed logs in console. For production, use PM2:

```bash
pm2 logs siswaconnect --lines 100
```

## Security Notes

1. **Never commit `.env`** - it contains sensitive credentials
2. **Use strong JWT_SECRET** - minimum 32 characters, random
3. **Always use prepared statements** - prevents SQL injection
4. **Hash passwords with bcrypt** - never store plain text
5. **Validate all inputs** - check required fields and types
6. **Enable HTTPS in production** - use SSL/TLS certificates
7. **Regular security updates** - `npm audit` and `npm update`

## Support

For issues or questions:
- Check [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
- Review server logs: `pm2 logs` or console output
- Check database connectivity
- Contact system administrator

---

**Version:** 3.0.0  
**Last Updated:** January 2026  
**Port:** 1991  
**Author:** ArifWbo
