import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Set default values for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.DB_NAME = process.env.DB_NAME || 'zirius_test';

// Global test setup
beforeAll(async () => {
  // Any global setup needed for all tests
});

afterAll(async () => {
  // Any global cleanup needed after all tests
});