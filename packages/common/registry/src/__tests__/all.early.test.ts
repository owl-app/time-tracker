// Unit tests for: all
import { ServiceRegistry } from '../service.registry';

// Import necessary modules and classes
describe('ServiceRegistry.all() all method', () => {
  let registry: ServiceRegistry<unknown>;

  beforeEach(() => {
    // Initialize a new ServiceRegistry instance before each test
    registry = new ServiceRegistry();
  });

  describe('Happy paths', () => {
    it('should return an empty object when no services are registered', () => {
      // Test that the all method returns an empty object initially
      expect(registry.all()).toEqual({});
    });

    it('should return all registered services', () => {
      // Register multiple services
      registry.register('service1', { name: 'Service 1' });
      registry.register('service2', { name: 'Service 2' });

      // Test that the all method returns all registered services
      expect(registry.all()).toEqual({
        service1: { name: 'Service 1' },
        service2: { name: 'Service 2' },
      });
    });

    it('should return a copy of the services object, not a reference', () => {
      // Register a service
      registry.register('service1', { name: 'Service 1' });

      // Get all services
      const services = registry.all();

      // Modify the returned object
      services.service1 = { name: 'Modified Service' };

      // Test that the original services object in the registry is not affected
      expect(registry.get('service1')).toEqual({ name: 'Service 1' });
    });
  });

  describe('Edge cases', () => {
    it('should handle services with special characters in identifiers', () => {
      // Register a service with special characters in the identifier
      registry.register('service-1@#$', { name: 'Special Service' });

      // Test that the all method correctly returns the service
      expect(registry.all()).toEqual({
        'service-1@#$': { name: 'Special Service' },
      });
    });

    it('should handle services with empty string identifiers', () => {
      // Register a service with an empty string identifier
      registry.register('', { name: 'Empty Identifier Service' });

      // Test that the all method correctly returns the service
      expect(registry.all()).toEqual({
        '': { name: 'Empty Identifier Service' },
      });
    });

    it('should handle services with null or undefined values', () => {
      // Register services with null and undefined values
      registry.register('nullService', null);
      registry.register('undefinedService', undefined);

      // Test that the all method correctly returns these services
      expect(registry.all()).toEqual({
        nullService: null,
        undefinedService: undefined,
      });
    });
  });
});

// End of unit tests for: all
