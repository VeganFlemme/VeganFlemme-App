import request from 'supertest';
import app from '../src/index';

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'VeganFlemme Engine is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('features');
      
      // Check service info
      expect(response.body.service).toHaveProperty('name', 'VeganFlemme Engine');
      expect(response.body.service).toHaveProperty('version', '1.0.0');
      
      // Check system info
      expect(response.body.system).toHaveProperty('uptime');
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system).toHaveProperty('cpu');
      
      // Check features
      expect(response.body.features).toHaveProperty('menuGeneration', 'active');
      expect(response.body.features).toHaveProperty('nutritionTracking', 'active');
    });
  });
});