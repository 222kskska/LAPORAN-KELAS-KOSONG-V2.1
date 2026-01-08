import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { DatabaseAdapter } from './database-adapter';

dotenv.config();

/**
 * MySQL Database Adapter
 * Wraps existing MySQL implementation with DatabaseAdapter interface
 */
export class MySQLAdapter implements DatabaseAdapter {
  private pool: mysql.Pool | null = null;

  async connect(): Promise<boolean> {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'siswa_connect',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });
      
      // Test connection
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL connected successfully');
      console.log(`📊 Database: ${process.env.DB_NAME || 'siswa_connect'}`);
      console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ MySQL connection failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T> {
    if (!this.pool) throw new Error('Database not connected');
    
    try {
      const [results] = await this.pool.execute(sql, params);
      return results as T;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.pool) throw new Error('Database not connected');
    
    try {
      const [result] = await this.pool.execute(sql, params);
      return result;
    } catch (error) {
      console.error('Execute error:', error);
      throw error;
    }
  }

  async transaction(callback: (adapter: DatabaseAdapter) => Promise<void>): Promise<void> {
    if (!this.pool) throw new Error('Database not connected');
    
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await callback(this);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a database connection (for manual transaction management)
   * This is used by existing code that manages transactions manually
   */
  async getConnection(): Promise<any> {
    if (!this.pool) throw new Error('Database not connected');
    return await this.pool.getConnection();
  }

  /**
   * Get the pool instance (for compatibility with existing code)
   */
  getPool(): mysql.Pool | null {
    return this.pool;
  }
}
