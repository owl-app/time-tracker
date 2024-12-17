// Unit tests for: register
import { ExistingServiceException } from '../exception/existing.service.exception';
import { ServiceRegistry } from '../service.registry';

describe('ServiceRegistry.register() register method', () => {
  let registry: ServiceRegistry<unknown>;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  describe('Happy Paths', () => {
    it('should register a new service successfully', () => {
      // Arrange
      const identifier = 'service1';
      const service = { name: 'Test Service' };

      // Act
      registry.register(identifier, service);

      // Assert
      expect(registry.has(identifier)).toBe(true);
      expect(registry.get(identifier)).toEqual(service);
    });

    it('should register multiple services successfully', () => {
      // Arrange
      const service1 = { name: 'Service One' };
      const service2 = { name: 'Service Two' };

      // Act
      registry.register('service1', service1);
      registry.register('service2', service2);

      // Assert
      expect(registry.has('service1')).toBe(true);
      expect(registry.has('service2')).toBe(true);
      expect(registry.get('service1')).toEqual(service1);
      expect(registry.get('service2')).toEqual(service2);
    });
  });

  describe('Edge Cases', () => {
    it('should throw an ExistingServiceException when trying to register a service with an existing identifier', () => {
      // Arrange
      const identifier = 'service1';
      const service = { name: 'Test Service' };
      registry.register(identifier, service);

      // Act & Assert
      expect(() => registry.register(identifier, service)).toThrow(ExistingServiceException);
    });

    it('should handle registering a service with an empty string identifier', () => {
      // Arrange
      const identifier = '';
      const service = { name: 'Empty Identifier Service' };

      // Act
      registry.register(identifier, service);

      // Assert
      expect(registry.has(identifier)).toBe(true);
      expect(registry.get(identifier)).toEqual(service);
    });

    it('should handle registering a service with a very long identifier', () => {
      // Arrange
      const identifier = 'a'.repeat(1000); // Very long identifier
      const service = { name: 'Long Identifier Service' };

      // Act
      registry.register(identifier, service);

      // Assert
      expect(registry.has(identifier)).toBe(true);
      expect(registry.get(identifier)).toEqual(service);
    });

    it('should handle registering a service with special characters in the identifier', () => {
      // Arrange
      const identifier = 'service!@#$%^&*()';
      const service = { name: 'Special Characters Service' };

      // Act
      registry.register(identifier, service);

      // Assert
      expect(registry.has(identifier)).toBe(true);
      expect(registry.get(identifier)).toEqual(service);
    });
  });
});

// End of unit tests for: register
