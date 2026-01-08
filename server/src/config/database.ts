import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { DatabaseFactory, DatabaseType } from './database-factory';
import { MySQLAdapter } from './mysql-adapter';

dotenv.config();

// Get database type from environment
const dbType = (process.env.DB_TYPE as DatabaseType) || DatabaseType.SQLITE;

// Create database adapter using factory
const dbAdapter = DatabaseFactory.create(dbType);

// Export adapter instance for direct use
export { dbAdapter };

// Backward compatibility: Export pool for MySQL (will be null for SQLite)
// This is for existing code that uses pool.getConnection() directly
export const pool = dbType === DatabaseType.MYSQL 
  ? (dbAdapter as MySQLAdapter).getPool() 
  : null;

// Test database connection
export async function testConnection(): Promise<boolean> {
  return await dbAdapter.connect();
}

// Helper function to execute queries with error handling
// This maintains the same interface as before
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  return await dbAdapter.query<T>(sql, params);
}

// Helper function for execute operations
export async function execute(sql: string, params?: any[]): Promise<any> {
  return await dbAdapter.execute(sql, params);
}

// Export the adapter for advanced usage
export default dbAdapter;
