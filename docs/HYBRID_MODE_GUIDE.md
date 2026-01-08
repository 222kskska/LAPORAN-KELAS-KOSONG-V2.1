# SiswaConnect Hybrid Mode - Technical Guide

## Overview

SiswaConnect now supports **Hybrid Mode**, allowing users to choose between:

1. **Standalone Mode (SQLite)** - Single PC, offline, no database server needed
2. **Network Mode (MySQL)** - Multi-user, network-based, centralized database

## Architecture

### Database Abstraction Layer

The application uses a factory pattern to abstract database operations:

```
┌─────────────────────────────────────┐
│     Application Layer (Routes)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Database Factory               │
│   (DatabaseFactory.create())        │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼─────┐  ┌─────▼──────┐
│   SQLite   │  │   MySQL    │
│  Adapter   │  │  Adapter   │
└────────────┘  └────────────┘
```

### Key Components

#### 1. Database Adapter Interface (`database-adapter.ts`)

Defines the contract all database implementations must follow:

```typescript
interface DatabaseAdapter {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T>;
  execute(sql: string, params?: any[]): Promise<any>;
  transaction(callback: Function): Promise<void>;
}
```

#### 2. SQLite Adapter (`sqlite-adapter.ts`)

- Uses `better-sqlite3` for high-performance SQLite operations
- Automatically converts MySQL syntax to SQLite
- Stores database in user's AppData directory
- Auto-initializes schema on first run

**Location:** 
- Windows: `%APPDATA%/SiswaConnect/siswaconnect.db`
- Linux/Mac: `~/.config/SiswaConnect/siswaconnect.db`

#### 3. MySQL Adapter (`mysql-adapter.ts`)

- Wraps existing MySQL implementation
- Uses connection pooling for performance
- Compatible with existing MySQL databases

#### 4. Database Factory (`database-factory.ts`)

Creates the appropriate adapter based on `DB_TYPE` environment variable:

```typescript
const db = DatabaseFactory.create(DatabaseType.SQLITE);
// or
const db = DatabaseFactory.create(DatabaseType.MYSQL);
```

## Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

**For SQLite Mode:**
```env
DB_TYPE=sqlite
PORT=1991
NODE_ENV=production
JWT_SECRET=your-secret-key-here
```

**For MySQL Mode:**
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=siswa_connect
PORT=1991
NODE_ENV=production
JWT_SECRET=your-secret-key-here
```

### Electron Configuration

The Electron app uses `electron-store` to persist configuration:

```typescript
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
```

## SQL Syntax Conversion

The SQLite adapter automatically converts MySQL syntax:

| MySQL | SQLite |
|-------|--------|
| `AUTO_INCREMENT` | `AUTOINCREMENT` |
| `NOW()` | `datetime('now')` |
| `CURDATE()` | `date('now')` |
| `VARCHAR(n)` | `TEXT` |
| `DATETIME` | `TEXT` |
| `BOOLEAN` | `INTEGER` |
| `ENUM(...)` | `TEXT` |
| `TRUE`/`FALSE` | `1`/`0` |

## Transaction Handling

Both adapters support transactions:

**SQLite:**
```typescript
await adapter.transaction(async (db) => {
  await db.execute(sql1, params1);
  await db.execute(sql2, params2);
  // Auto-commit on success, auto-rollback on error
});
```

**MySQL:**
```typescript
await adapter.transaction(async (db) => {
  await db.execute(sql1, params1);
  await db.execute(sql2, params2);
  // Auto-commit on success, auto-rollback on error
});
```

## Migration Path

### From Standalone to Network

1. **Export SQLite data:**
   ```bash
   sqlite3 siswaconnect.db .dump > backup.sql
   ```

2. **Convert to MySQL:**
   - Remove SQLite-specific syntax
   - Import to MySQL database

3. **Reconfigure app:**
   - Use "Reset Configuration" from app menu
   - Choose Network mode
   - Enter MySQL credentials

### From Network to Standalone

1. **Export MySQL data:**
   ```bash
   mysqldump -u root -p siswa_connect > backup.sql
   ```

2. **Stop application**

3. **Reset configuration and choose Standalone mode**

4. **Import data** (if needed)

## Performance Considerations

### SQLite Mode

- **Pros:**
  - No network latency
  - No database server overhead
  - Simpler deployment
  - Good for < 10 concurrent users

- **Cons:**
  - Single file (corruption risk)
  - Limited concurrent writes
  - Not suitable for > 20 users

### MySQL Mode

- **Pros:**
  - Handles many concurrent users
  - Better data safety (replication possible)
  - Centralized management
  - Scales to 100+ users

- **Cons:**
  - Requires database server
  - Network dependency
  - More complex setup

## Troubleshooting

### SQLite Issues

**Database locked:**
- Close other applications accessing the database
- Check for zombie processes

**Corruption:**
- Run `.recover` command in sqlite3
- Restore from backup

### MySQL Issues

**Connection refused:**
- Check MySQL service is running
- Verify host/port settings
- Check firewall rules

**Access denied:**
- Verify username/password
- Grant proper permissions:
  ```sql
  GRANT ALL PRIVILEGES ON siswa_connect.* TO 'user'@'%';
  FLUSH PRIVILEGES;
  ```

## Development

### Running in Development

**SQLite mode:**
```bash
cd server
DB_TYPE=sqlite npm run dev
```

**MySQL mode:**
```bash
cd server
DB_TYPE=mysql npm run dev
```

### Testing

Test both modes:

```bash
# Test SQLite
DB_TYPE=sqlite npm test

# Test MySQL
DB_TYPE=mysql npm test
```

### Building

Build both frontend and backend:

```bash
npm run build:all
```

Build Electron installer:

```bash
npm run build:electron
```

## Security

### SQLite Security

- Database file permissions: Read/write only for user
- Located in user's app data (protected directory)
- Enable encryption (optional): Use `sqlcipher`

### MySQL Security

- Use strong passwords
- Enable SSL connections
- Restrict user permissions
- Regular backups
- Network isolation (if possible)

## Best Practices

1. **Regular backups** - Both modes
2. **Monitor disk space** - SQLite mode
3. **Connection pooling** - MySQL mode
4. **Index optimization** - Both modes
5. **Query logging** - Development only
6. **Error handling** - All database operations

## API Compatibility

All existing API endpoints work with both database types:

- `/api/auth/login`
- `/api/users`
- `/api/teachers`
- `/api/classes`
- `/api/reports`
- `/api/teacher-leaves`

No client-side changes needed!

## Future Enhancements

- PostgreSQL support
- MongoDB adapter for NoSQL option
- Real-time sync between SQLite and MySQL
- Automated backup/restore
- Database health monitoring
- Performance metrics dashboard
