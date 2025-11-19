import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  timezone: string;
  charset: string;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ziriuzco_ziriuz',
  timezone: '-05:00',
  charset: 'utf8'
};

// Connection pool
const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  charset: dbConfig.charset,
  timezone: dbConfig.timezone,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = pool;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async getConnection(): Promise<mysql.PoolConnection> {
    return await this.pool.getConnection();
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  public async beginTransaction(): Promise<mysql.PoolConnection> {
    const connection = await this.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  public async commit(connection: mysql.PoolConnection): Promise<void> {
    await connection.commit();
    connection.release();
  }

  public async rollback(connection: mysql.PoolConnection): Promise<void> {
    await connection.rollback();
    connection.release();
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
}

// Export default database instance
export default Database.getInstance();

// Export pool for direct usage
export { pool };

// Export db as an alias for default export (for legacy compatibility)
export const db = Database.getInstance();

// Export DatabaseConnection as an alias for the Database class (for legacy compatibility)
export const DatabaseConnection = Database;

// Export AppDataSource as an alias for compatibility with TypeORM-style usage
export const AppDataSource = Database.getInstance();