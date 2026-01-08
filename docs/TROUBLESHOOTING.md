# Troubleshooting Guide

Common issues and solutions for SiswaConnect.

## Database Issues

### MySQL Connection Refused
**Problem:** Cannot connect to MySQL

**Solutions:**
1. Check MySQL is running: `sc query MySQL` or `net start MySQL`
2. Verify credentials in `.env`
3. Check firewall settings
4. Ensure database exists: `SHOW DATABASES;`

### Import Failed
**Problem:** Error importing schema/seed

**Solutions:**
1. Check MySQL version >= 5.7
2. Use correct path in import command
3. Check error.log for details
4. Try manual import: `mysql -u root -p < database/schema.sql`

## Server Issues

### Port Already in Use
**Problem:** `EADDRINUSE :::1991`

**Solutions:**
1. Find process: `netstat -ano | findstr :1991`
2. Kill process: `taskkill /PID <PID> /F`
3. Or use different port in `.env`

### JWT Token Invalid
**Problem:** 401/403 errors

**Solutions:**
1. Token expired - login again
2. JWT_SECRET changed - all tokens invalidated
3. Check Authorization header format: `Bearer <token>`

### Module Not Found
**Problem:** Cannot find module errors

**Solutions:**
```cmd
cd server
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Network Issues

### Cannot Access from Client
**Problem:** Clients can't reach server

**Solutions:**
1. Check server IP: `ipconfig`
2. Ping server: `ping 192.168.1.100`
3. Check firewall: `netsh advfirewall firewall show rule name=SiswaConnect`
4. Verify CLIENT_URL in `.env`

## Application Issues

### Login Not Working
**Problem:** Cannot login with credentials

**Solutions:**
1. Verify database has users: `SELECT * FROM users;`
2. Check password hash matches seed data
3. Review browser console for errors
4. Check API response in Network tab

### Reports Not Showing
**Problem:** Reports list is empty

**Solutions:**
1. Check database: `SELECT * FROM reports;`
2. Verify API endpoint: `curl http://localhost:1991/api/reports`
3. Check authentication token
4. Review browser console

## Performance Issues

### Slow Queries
**Solutions:**
1. Add indexes (already in schema)
2. Optimize tables: `OPTIMIZE TABLE reports;`
3. Increase MySQL connections
4. Use connection pooling (already implemented)

### High Memory Usage
**Solutions:**
1. Check PM2 logs: `pm2 logs`
2. Restart server: `pm2 restart siswaconnect`
3. Increase server RAM
4. Review activity_logs table size

## Getting Help

1. Check server logs: `pm2 logs` or console
2. Check database: `mysql -u root -p siswa_connect`
3. Review activity_logs table
4. Contact system administrator

---

**Version:** 3.0.0
