import { ServiceRegistry } from '../service.registry';
import { ExistingServiceException } from '../exception/existing.service.exception';
import { NonExistingServiceException } from '../exception/non-existing.service.exception';

describe('ServiceRegistry', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serviceRegistry: ServiceRegistry<any>;

  beforeEach(() => {
    serviceRegistry = new ServiceRegistry();
  });

  describe('all', () => {
    it('returns a copied object of all registered services', () => {
      serviceRegistry.register('serviceA', { name: 'A' });
      serviceRegistry.register('serviceB', { name: 'B' });
      const allServices = serviceRegistry.all();
      expect(allServices).toHaveProperty('serviceA');
      expect(allServices).toHaveProperty('serviceB');
      // Ensure it is a clone, not the same reference
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(allServices['serviceA']).not.toBe(serviceRegistry['services']['serviceA']);
    });

    it('should return a copy of the services object, not a reference', () => {
      serviceRegistry.register('service1', { name: 'Service 1' });

      const services = serviceRegistry.all();

      services.service1 = { name: 'Modified Service' };

      expect(serviceRegistry.get('service1')).toEqual({ name: 'Service 1' });
    });

    it('should handle services with empty string identifiers', () => {
      serviceRegistry.register('', { name: 'Empty Identifier Service' });

      expect(serviceRegistry.all()).toEqual({
        '': { name: 'Empty Identifier Service' },
      });
    });

    it('should handle services with null or undefined values', () => {
      serviceRegistry.register('nullService', null);
      serviceRegistry.register('undefinedService', undefined);

      expect(serviceRegistry.all()).toEqual({
        nullService: null,
        undefinedService: undefined,
      });
    });

    it('returns an empty object if no services registered', () => {
      expect(Object.keys(serviceRegistry.all()).length).toBe(0);
    });
  });

  describe('register', () => {
    it('registers a new service', () => {
      serviceRegistry.register('newService', { foo: 'bar' });
      expect(serviceRegistry.has('newService')).toBe(true);
    });

    it('throws ExistingServiceException if service already registered', () => {
      serviceRegistry.register('sameService', { val: 1 });
      expect(() => {
        serviceRegistry.register('sameService', { val: 2 });
      }).toThrow(ExistingServiceException);
    });
  });

  describe('unregister', () => {
    it('unregisters an existing service', () => {
      serviceRegistry.register('toRemove', { data: 123 });
      serviceRegistry.unregister('toRemove');
      expect(serviceRegistry.has('toRemove')).toBe(false);
    });

    it('throws NonExistingServiceException for non-existent service', () => {
      expect(() => {
        serviceRegistry.unregister('notThere');
      }).toThrow(NonExistingServiceException);
    });
  });

  describe('has', () => {
    it('returns true when a service is registered under the identifier', () => {
      serviceRegistry.register('testService', { example: 'data' });
      expect(serviceRegistry.has('testService')).toBe(true);
    });

    it('returns false when no service is registered with the given identifier', () => {
      expect(serviceRegistry.has('unknown')).toBe(false);
    });

    it('returns false for an empty string identifier', () => {
      expect(serviceRegistry.has('')).toBe(false);
    });

    it('returns false for null identifier', () => {
      expect(serviceRegistry.has(null as unknown as string)).toBe(false);
    });

    it('returns false for undefined identifier', () => {
      expect(serviceRegistry.has(undefined as unknown as string)).toBe(false);
    });

    it('handles special character identifiers', () => {
      serviceRegistry.register('!@#$', { weird: 'chars' });
      expect(serviceRegistry.has('!@#$')).toBe(true);
    });

    it('is case-sensitive', () => {
      serviceRegistry.register('lower', { data: 1 });
      expect(serviceRegistry.has('lower')).toBe(true);
      expect(serviceRegistry.has('Lower')).toBe(false);
    });
  });

  describe('get', () => {
    it('returns the registered service properly cloned', () => {
      const original = { sample: 'value' };
      serviceRegistry.register('someService', original);
      const retrieved = serviceRegistry.get('someService');
      expect(retrieved).toEqual(original);
      expect(retrieved).not.toBe(original);
    });

    it('should handle services with complex nested structures', () => {
      const complexService = {
        name: 'ComplexService',
        data: { nested: { value: 42 } },
      };
      serviceRegistry.register('complexService', complexService);

      const retrievedService = serviceRegistry.get('complexService');

      expect(retrievedService).toEqual(complexService);
      expect(retrievedService.data).not.toBe(complexService.data);
    });

    it('should handle empty string as a valid identifier', () => {
      const service = { name: 'EmptyIdentifierService' };
      serviceRegistry.register('', service);

      const retrievedService = serviceRegistry.get('');

      expect(retrievedService).toEqual(service);
      expect(retrievedService).not.toBe(service);
    });

    it('throws NonExistingServiceException when attempting to get non-existent service', () => {
      expect(() => {
        serviceRegistry.get('notThere');
      }).toThrow(NonExistingServiceException);
    });
  });
});
