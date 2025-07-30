import request from 'supertest';
import app from '../src/app';

describe('Menu Endpoints', () => {
  describe('POST /api/menu/generate', () => {
    it('should generate a menu with valid preferences', async () => {
      const preferences = {
        people: 2,
        budget: 'medium',
        cookingTime: 'medium',
        dietaryRestrictions: ['gluten'],
        nutritionalGoals: {}
      };

      const response = await request(app)
        .post('/api/menu/generate')
        .send(preferences)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('days');
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data).toHaveProperty('shoppingList');
      
      // Check days structure
      expect(Array.isArray(response.body.data.days)).toBe(true);
      expect(response.body.data.days.length).toBeGreaterThan(0);
      
      // Check analysis structure
      expect(response.body.data.analysis).toHaveProperty('nutritionSummary');
      expect(response.body.data.analysis).toHaveProperty('rnpCoverage');
    });

    it('should handle empty preferences', async () => {
      const response = await request(app)
        .post('/api/menu/generate')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.parameters.people).toBe(2); // default value
    });
  });

  describe('GET /api/menu/recipes/:id', () => {
    it('should return recipe details', async () => {
      const recipeId = 'breakfast_1';
      
      const response = await request(app)
        .get(`/api/menu/recipes/${recipeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', recipeId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('instructions');
      expect(response.body.data).toHaveProperty('nutritionDetails');
    });
  });

  describe('POST /api/menu/swap-ingredient', () => {
    it('should provide ingredient swap suggestions', async () => {
      const swapRequest = {
        ingredient: 'tofu',
        reason: 'dislike',
        nutritionalTarget: 'high-protein'
      };

      const response = await request(app)
        .post('/api/menu/swap-ingredient')
        .send(swapRequest)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('suggestions');
      expect(response.body.data).toHaveProperty('preservesBalance');
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    });

    it('should return 400 when ingredient is missing', async () => {
      await request(app)
        .post('/api/menu/swap-ingredient')
        .send({})
        .expect(400);
    });
  });
});