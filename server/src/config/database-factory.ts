import { DatabaseAdapter } from './database-adapter';
import { SQLiteAdapter } from './sqlite-adapter';
import { MySQLAdapter } from './mysql-adapter';

export enum DatabaseType {
  SQLITE = 'sqlite',
  MYSQL = 'mysql'
}

/**
 * Database Factory
 * Creates the appropriate database adapter based on configuration
 */
export class DatabaseFactory {
  /**
   * Create a database adapter instance
   * @param type - Database type (optional, defaults to env variable or SQLite)
   * @returns DatabaseAdapter instance
   */
  static create(type?: DatabaseType): DatabaseAdapter {
    const dbType = type || (process.env.DB_TYPE as DatabaseType) || DatabaseType.SQLITE;
    
    switch (dbType) {
      case DatabaseType.SQLITE:
        return new SQLiteAdapter();
      case DatabaseType.MYSQL:
        return new MySQLAdapter();
      default:
        throw new Error(`Unknown database type: ${dbType}`);
    }
  }
}
