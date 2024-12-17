import { FactoryProvider, InjectionToken, OptionalFactoryDependency, Type } from '@nestjs/common';
import { ServiceRegistry, Registry } from '@owl-app/registry';

export function createServiceRegistryProvider<T>(
  nameService: string,
  services: Record<string, Type<T>> = {}
): FactoryProvider<Registry<T>> {
  const servicesNames: Array<string> = [];
  const servicesInjections: Array<InjectionToken | OptionalFactoryDependency> = [];

  Object.keys(services).forEach((key) => {
    servicesNames.push(key);
    servicesInjections.push(services[key]);
  });

  return {
    provide: nameService,
    useFactory(...rules: Array<T>): Registry<T> {
      const serviceRegistry = new ServiceRegistry<T>(nameService);

      rules.forEach((service, index) => {
        serviceRegistry.register(servicesNames[index], service);
      });

      return serviceRegistry;
    },
    inject: servicesInjections,
  };
}
