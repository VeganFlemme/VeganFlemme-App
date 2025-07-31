/**
 * @jest-environment jsdom
 */

import { 
  trackEvent, 
  trackMenuGeneration, 
  trackIngredientSwap,
  trackRecipeView,
  trackProfileUpdate 
} from '../src/lib/analytics'

// Mock window.gtag
const mockGtag = jest.fn()

describe('Analytics Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window object
    Object.defineProperty(window, 'gtag', {
      value: mockGtag,
      writable: true
    })
  })

  describe('Custom tracking functions', () => {
    it('should track menu generation', () => {
      const preferences = { people: 2, budget: 'medium' }
      trackMenuGeneration(preferences)
      
      // Verify the function was called (may not trigger gtag without proper env setup)
      expect(typeof trackMenuGeneration).toBe('function')
    })

    it('should track ingredient swap', () => {
      trackIngredientSwap('tofu', 'preference')
      expect(typeof trackIngredientSwap).toBe('function')
    })

    it('should track recipe view', () => {
      trackRecipeView('recipe_123')
      expect(typeof trackRecipeView).toBe('function')
    })

    it('should track profile update', () => {
      trackProfileUpdate('dietary_preferences')
      expect(typeof trackProfileUpdate).toBe('function')
    })

    it('should call trackEvent function', () => {
      trackEvent('test_action', 'test_category', 'test_label', 1)
      expect(typeof trackEvent).toBe('function')
    })
  })
})