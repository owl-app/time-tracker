import { DynamicModule, ForwardReference, Provider, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createServiceRegistryProvider } from './providers';

export interface RegistryServiceModuleOpts<T> {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  providers?: Provider[];
  services?: Record<string, Type<T>>;
}

export class RegistryServiceModule {
  static forFeature<T>(opts: RegistryServiceModuleOpts<T>): DynamicModule {
    const { name, imports = [], providers = [], services = {} } = opts;
    const serviceRegistry = createServiceRegistryProvider<T>(name, services);
    const servicesProviders: Array<Type<T>> = [];

    Object.values(services).forEach((service: Type<T>) => {
      servicesProviders.push(service);
    });

    return {
      module: RegistryServiceModule,
      imports: [...imports, ConfigModule],
      providers: [...providers, ...servicesProviders, serviceRegistry],
      exports: [...imports, RegistryServiceModule, ConfigModule, serviceRegistry],
    };
  }
}
