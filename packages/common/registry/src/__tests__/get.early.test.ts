// Unit tests for: get
import { NonExistingServiceException } from '../exception/non-existing.service.exception';
import { ServiceRegistry } from '../service.registry';

describe('ServiceRegistry.get() get method', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let registry: ServiceRegistry<any>;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  describe('Happy paths', () => {
    it('should return a deep clone of the registered service when it exists', () => {
      // Arrange: Register a service
      const service = { name: 'TestService', config: { enabled: true } };
      registry.register('testService', service);

      // Act: Retrieve the service
      const retrievedService = registry.get('testService');

      // Assert: The retrieved service should be a deep clone of the original
      expect(retrievedService).toEqual(service);
      expect(retrievedService).not.toBe(service); // Ensure it's a clone, not the same reference
    });
  });

  describe('Edge cases', () => {
    it('should throw NonExistingServiceException when trying to get a non-registered service', () => {
      // Arrange: Ensure no service is registered with the identifier
      const identifier = 'nonExistentService';

      // Act & Assert: Attempting to get a non-registered service should throw an exception
      expect(() => registry.get(identifier)).toThrow(NonExistingServiceException);
    });

    it('should handle services with complex nested structures', () => {
      // Arrange: Register a service with a complex nested structure
      const complexService = {
        name: 'ComplexService',
        data: { nested: { value: 42 } },
      };
      registry.register('complexService', complexService);

      // Act: Retrieve the service
      const retrievedService = registry.get('complexService');

      // Assert: The retrieved service should be a deep clone of the original
      expect(retrievedService).toEqual(complexService);
      expect(retrievedService.data).not.toBe(complexService.data); // Ensure nested objects are cloned
    });

    it('should handle empty string as a valid identifier', () => {
      // Arrange: Register a service with an empty string identifier
      const service = { name: 'EmptyIdentifierService' };
      registry.register('', service);

      // Act: Retrieve the service
      const retrievedService = registry.get('');

      // Assert: The retrieved service should be a deep clone of the original
      expect(retrievedService).toEqual(service);
      expect(retrievedService).not.toBe(service); // Ensure it's a clone, not the same reference
    });

    it('should handle identifiers with special characters', () => {
      // Arrange: Register a service with special characters in the identifier
      const service = { name: 'SpecialCharService' };
      const identifier = '!@#$%^&*()_+';
      registry.register(identifier, service);

      // Act: Retrieve the service
      const retrievedService = registry.get(identifier);

      // Assert: The retrieved service should be a deep clone of the original
      expect(retrievedService).toEqual(service);
      expect(retrievedService).not.toBe(service); // Ensure it's a clone, not the same reference
    });
  });
});

// End of unit tests for: get
