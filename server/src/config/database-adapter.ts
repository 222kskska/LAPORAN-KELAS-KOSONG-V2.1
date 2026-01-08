/**
 * Database Adapter Interface
 * Provides abstraction layer for different database types (SQLite, MySQL)
 */
export interface DatabaseAdapter {
  /**
   * Connect to the database
   * @returns Promise<boolean> - true if connection successful
   */
  connect(): Promise<boolean>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Execute a SELECT query and return results
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Promise<T> - Query results
   */
  query<T>(sql: string, params?: any[]): Promise<T>;

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   * @param sql - SQL statement
   * @param params - Statement parameters
   * @returns Promise<any> - Execution result
   */
  execute(sql: string, params?: any[]): Promise<any>;

  /**
   * Execute multiple statements within a transaction
   * @param callback - Function to execute within transaction
   */
  transaction(callback: (adapter: DatabaseAdapter) => Promise<void>): Promise<void>;

  /**
   * Get a database connection for transaction handling
   * Used by MySQL adapter for manual transaction management
   */
  getConnection?(): Promise<any>;
}
