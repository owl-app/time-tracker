// Unit tests for: has
import { ServiceRegistry } from '../service.registry';

describe('ServiceRegistry.has() has method', () => {
  let serviceRegistry: ServiceRegistry<unknown>;

  beforeEach(() => {
    serviceRegistry = new ServiceRegistry();
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return true when a service is registered with the given identifier', () => {
      // Arrange
      const identifier = 'testService';
      const service = { name: 'Test Service' };
      serviceRegistry.register(identifier, service);

      // Act
      const result = serviceRegistry.has(identifier);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no service is registered with the given identifier', () => {
      // Arrange
      const identifier = 'nonExistentService';

      // Act
      const result = serviceRegistry.has(identifier);

      // Assert
      expect(result).toBe(false);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return false for an empty string identifier', () => {
      // Arrange
      const identifier = '';

      // Act
      const result = serviceRegistry.has(identifier);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for a null identifier', () => {
      // Arrange
      const identifier = null as unknown as string;

      // Act
      const result = serviceRegistry.has(identifier);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an undefined identifier', () => {
      // Arrange
      const identifier = undefined as unknown as string;

      // Act
      const result = serviceRegistry.has(identifier);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle identifiers with special characters', () => {
      // Arrange
      const identifier = '!@#$%^&*()_+';
      const service = { name: 'Special Service' };
      serviceRegistry.register(identifier, service);

      // Act
      const result = serviceRegistry.has(identifier);

      // Assert
      expect(result).toBe(true);
    });

    it('should be case-sensitive when checking identifiers', () => {
      // Arrange
      const identifierLowerCase = 'testservice';
      const identifierUpperCase = 'TestService';
      const service = { name: 'Case Sensitive Service' };
      serviceRegistry.register(identifierLowerCase, service);

      // Act
      const resultLowerCase = serviceRegistry.has(identifierLowerCase);
      const resultUpperCase = serviceRegistry.has(identifierUpperCase);

      // Assert
      expect(resultLowerCase).toBe(true);
      expect(resultUpperCase).toBe(false);
    });
  });
});

// End of unit tests for: has
