// Unit tests for: unregister
import { NonExistingServiceException } from '../exception/non-existing.service.exception';
import { ServiceRegistry } from '../service.registry';

describe('ServiceRegistry.unregister() unregister method', () => {
  let registry: ServiceRegistry<unknown>;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should successfully unregister an existing service', () => {
      // Arrange: Register a service
      const serviceIdentifier = 'testService';
      const service = { name: 'Test Service' };
      registry.register(serviceIdentifier, service);

      // Act: Unregister the service
      registry.unregister(serviceIdentifier);

      // Assert: The service should no longer exist in the registry
      expect(registry.has(serviceIdentifier)).toBe(false);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should throw NonExistingServiceException when trying to unregister a non-existing service', () => {
      // Arrange: Define a non-existing service identifier
      const nonExistingServiceIdentifier = 'nonExistingService';

      // Act & Assert: Attempting to unregister should throw an exception
      expect(() => {
        registry.unregister(nonExistingServiceIdentifier);
      }).toThrow(NonExistingServiceException);
    });

    it('should handle unregistering when the registry is empty', () => {
      // Arrange: Ensure the registry is empty
      const emptyServiceIdentifier = 'emptyService';

      // Act & Assert: Attempting to unregister should throw an exception
      expect(() => {
        registry.unregister(emptyServiceIdentifier);
      }).toThrow(NonExistingServiceException);
    });

    it('should not affect other services when unregistering a service', () => {
      // Arrange: Register multiple services
      const service1Identifier = 'service1';
      const service2Identifier = 'service2';
      const service1 = { name: 'Service 1' };
      const service2 = { name: 'Service 2' };
      registry.register(service1Identifier, service1);
      registry.register(service2Identifier, service2);

      // Act: Unregister one service
      registry.unregister(service1Identifier);

      // Assert: The other service should still exist
      expect(registry.has(service2Identifier)).toBe(true);
      expect(registry.has(service1Identifier)).toBe(false);
    });
  });
});

// End of unit tests for: unregister
