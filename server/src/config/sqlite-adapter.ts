import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseAdapter } from './database-adapter';

/**
 * SQLite Database Adapter
 * Implements DatabaseAdapter interface for SQLite databases
 */
export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // Determine database location
    // In production (Electron), use app data directory
    // In development, use project root
    const userDataPath = process.env.APPDATA || process.env.HOME || '.';
    const appDir = path.join(userDataPath, 'SiswaConnect');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    
    this.dbPath = path.join(appDir, 'siswaconnect.db');
  }

  async connect(): Promise<boolean> {
    try {
      this.db = new Database(this.dbPath);
      
      // Enable foreign keys (disabled by default in SQLite)
      this.db.pragma('foreign_keys = ON');
      
      // Performance optimizations
      this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
      this.db.pragma('synchronous = NORMAL'); // Faster writes with minimal risk
      
      // Initialize schema if new database
      if (this.isNewDatabase()) {
        await this.initializeSchema();
      }
      
      console.log('✅ SQLite connected:', this.dbPath);
      return true;
    } catch (error) {
      console.error('❌ SQLite connection failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T> {
    if (!this.db) throw new Error('Database not connected');
    
    // Convert MySQL syntax to SQLite if needed
    const sqliteSql = this.convertToSQLite(sql);
    
    try {
      const stmt = this.db.prepare(sqliteSql);
      const results = stmt.all(...params);
      return results as T;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not connected');
    
    const sqliteSql = this.convertToSQLite(sql);
    const stmt = this.db.prepare(sqliteSql);
    const result = stmt.run(...params);
    
    // Return MySQL-compatible result format
    return {
      insertId: result.lastInsertRowid,
      affectedRows: result.changes,
      fieldCount: 0,
      info: '',
      serverStatus: 0,
      warningStatus: 0
    };
  }

  async transaction(callback: (adapter: DatabaseAdapter) => Promise<void>): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    
    const transaction = this.db.transaction(async () => {
      await callback(this);
    });
    
    transaction();
  }

  /**
   * Check if database is newly created (no tables)
   */
  private isNewDatabase(): boolean {
    if (!this.db) return false;
    const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    return tables.length === 0;
  }

  /**
   * Initialize database schema for new database
   */
  private async initializeSchema(): Promise<void> {
    const schemaPath = path.join(__dirname, '../../../database/schema-sqlite.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db!.exec(schema);
      console.log('✅ Schema initialized');
    } else {
      console.warn('⚠️  SQLite schema file not found at:', schemaPath);
    }
    
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      // Convert MySQL-specific syntax in seed data
      const sqliteSeed = this.convertToSQLite(seed);
      this.db!.exec(sqliteSeed);
      console.log('✅ Seed data loaded');
    }
  }

  /**
   * Convert MySQL-specific SQL syntax to SQLite
   * @param sql - Original SQL string
   * @returns SQLite-compatible SQL string
   */
  private convertToSQLite(sql: string): string {
    return sql
      // MySQL AUTO_INCREMENT -> SQLite AUTOINCREMENT
      .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
      
      // MySQL NOW() -> SQLite datetime('now')
      .replace(/NOW\(\)/gi, "datetime('now')")
      
      // MySQL CURDATE() -> SQLite date('now')
      .replace(/CURDATE\(\)/gi, "date('now')")
      
      // MySQL CURRENT_TIMESTAMP -> SQLite datetime('now')
      .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')")
      
      // Boolean values
      .replace(/\bTRUE\b/gi, '1')
      .replace(/\bFALSE\b/gi, '0')
      
      // Data types
      .replace(/INT\(\d+\)/gi, 'INTEGER')
      .replace(/TINYINT\(\d+\)/gi, 'INTEGER')
      .replace(/SMALLINT\(\d+\)/gi, 'INTEGER')
      .replace(/MEDIUMINT\(\d+\)/gi, 'INTEGER')
      .replace(/BIGINT\(\d+\)/gi, 'INTEGER')
      .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
      .replace(/CHAR\(\d+\)/gi, 'TEXT')
      .replace(/\bDATETIME\b/gi, 'TEXT')
      .replace(/\bTIMESTAMP\b/gi, 'TEXT')
      .replace(/\bDATE\b/gi, 'TEXT')
      .replace(/\bTIME\b/gi, 'TEXT')
      
      // ENUM -> TEXT (SQLite doesn't have ENUM)
      .replace(/ENUM\([^)]+\)/gi, 'TEXT')
      
      // TEXT types
      .replace(/\bLONGTEXT\b/gi, 'TEXT')
      .replace(/\bMEDIUMTEXT\b/gi, 'TEXT')
      .replace(/\bTINYTEXT\b/gi, 'TEXT')
      
      // Remove MySQL-specific keywords
      .replace(/\bON UPDATE CURRENT_TIMESTAMP\b/gi, '')
      .replace(/\bENGINE\s*=\s*InnoDB/gi, '')
      .replace(/\bDEFAULT CHARSET\s*=\s*\w+/gi, '')
      .replace(/\bCOLLATE\s*=?\s*\w+/gi, '')
      .replace(/\bCHARACTER SET\s+\w+/gi, '')
      
      // BOOLEAN -> INTEGER
      .replace(/\bBOOLEAN\b/gi, 'INTEGER');
  }
}
