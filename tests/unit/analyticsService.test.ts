import { trackEvent } from '../../services/analyticsService';

describe('analyticsService', () => {
  describe('trackEvent', () => {
    it('should accept event name without details', () => {
      // Since this is a stub function that doesn't do anything,
      // we just verify it can be called without errors
      expect(() => trackEvent('test_event')).not.toThrow();
    });

    it('should accept event name with details', () => {
      const eventDetails = {
        category: 'food',
        action: 'add',
        value: 100
      };
      
      expect(() => trackEvent('food_added', eventDetails)).not.toThrow();
    });

    it('should handle empty event details object', () => {
      expect(() => trackEvent('test_event', {})).not.toThrow();
    });

    it('should handle complex event details', () => {
      const complexDetails = {
        user_id: '123',
        food_items: ['apple', 'banana'],
        calories: 200,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'manual',
          app_version: '1.0.0'
        }
      };
      
      expect(() => trackEvent('complex_event', complexDetails)).not.toThrow();
    });

    it('should handle null/undefined event details', () => {
      expect(() => trackEvent('test_event', null as any)).not.toThrow();
      expect(() => trackEvent('test_event', undefined)).not.toThrow();
    });
  });
});