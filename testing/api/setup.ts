import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/showcase-test';

// Global test setup
beforeEach(() => {
  // Clear any mock calls between tests
  jest.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup if needed
});