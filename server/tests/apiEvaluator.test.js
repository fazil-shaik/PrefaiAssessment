const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/api-evaluator-test';
  
  // Connect to test database
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('Test database connection error:', error);
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    console.error('Test database cleanup error:', error);
  }
});

describe('API Evaluator Tests', () => {
  // Test the health check endpoint
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });

  // Test the API evaluation endpoint
  describe('POST /api/evaluate', () => {
    it('should return 400 for invalid OpenAPI spec', async () => {
      const response = await request(app)
        .post('/api/evaluate')
        .send({ spec: 'invalid-spec' });
      expect(response.status).toBe(400);
    });

    it('should return 200 for valid OpenAPI spec', async () => {
      const validSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'OK'
                }
              }
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/evaluate')
        .send({ spec: validSpec });
      expect(response.status).toBe(200);
    });
  });
}); 