import { AppDataSource } from './database';
import { Client } from 'pg';
import { createLogger } from '../infrastructure/logging';

const logger = createLogger('DatabaseInitializer');

export const initializeDatabase = async () => {
  try {
    await ensureDatabaseExists();
    await AppDataSource.initialize();
    logger.info('Data Source has been initialized!');
  } catch (error) {
    logger.error('Error during Data Source initialization:', { error: error as Error });
    throw error;
  }
};

async function ensureDatabaseExists() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  };

  const targetDatabase = process.env.DB_NAME || 'tsnodebaseapi';

  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  try {
    await client.connect();

    // Check if database exists
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      targetDatabase,
    ]);

    if (result.rows.length === 0) {
      logger.info(`Creating database: ${targetDatabase}`);

      // Create database
      await client.query(`CREATE DATABASE "${targetDatabase}"`);

      // Enable uuid-ossp extension
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

      logger.info(`Database ${targetDatabase} created successfully`);
    } else {
      logger.info(`Database ${targetDatabase} already exists`);
    }
  } catch (error) {
    logger.error('Error ensuring database exists:', { error: error as Error });
    throw error;
  } finally {
    await client.end();
  }
}
