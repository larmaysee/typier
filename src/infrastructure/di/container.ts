export interface Container {
  register<T>(token: string, factory: () => T): void;
  resolve<T>(token: string): T;
}

class DIContainer implements Container {
  private registry = new Map<string, () => any>();

  register<T>(token: string, factory: () => T): void {
    this.registry.set(token, factory);
  }

  resolve<T>(token: string): T {
    const factory = this.registry.get(token);
    if (!factory) {
      throw new Error(`No registration found for token: ${token}`);
    }
    return factory();
  }
}

export const container = new DIContainer();
/**
 * Dependency Injection Container
 * Provides type-safe service registration and resolution
 */

export enum ServiceLifetime {
  Singleton = 'singleton',
  Transient = 'transient',
  Scoped = 'scoped'
}

export interface ServiceDescriptor<T = any> {
  token: string;
  implementation: T | (() => T);
  lifetime: ServiceLifetime;
  instance?: T;
}

export interface IDependencyContainer {
  register<T>(token: string, implementation: T | (() => T), lifetime?: ServiceLifetime): void;
  resolve<T>(token: string): T;
  registerSingleton<T>(token: string, implementation: () => T): void;
  registerTransient<T>(token: string, implementation: () => T): void;
  registerScoped<T>(token: string, implementation: () => T): void;
  isRegistered(token: string): boolean;
  dispose(): void;
}

export class DependencyContainer implements IDependencyContainer {
  private services: Map<string, ServiceDescriptor> = new Map();
  private scopedInstances: Map<string, any> = new Map();
  private disposed = false;

  register<T>(token: string, implementation: T | (() => T), lifetime: ServiceLifetime = ServiceLifetime.Transient): void {
    if (this.disposed) {
      throw new Error('Cannot register services on disposed container');
    }

    this.services.set(token, {
      token,
      implementation,
      lifetime
    });
  }

  registerSingleton<T>(token: string, implementation: () => T): void {
    this.register(token, implementation, ServiceLifetime.Singleton);
  }

  registerTransient<T>(token: string, implementation: () => T): void {
    this.register(token, implementation, ServiceLifetime.Transient);
  }

  registerScoped<T>(token: string, implementation: () => T): void {
    this.register(token, implementation, ServiceLifetime.Scoped);
  }

  resolve<T>(token: string): T {
    if (this.disposed) {
      throw new Error('Cannot resolve services from disposed container');
    }

    const descriptor = this.services.get(token);
    if (!descriptor) {
      throw new Error(`Service '${token}' is not registered`);
    }

    try {
      return this.createInstance<T>(descriptor);
    } catch (error) {
      throw new Error(`Failed to resolve service '${token}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isRegistered(token: string): boolean {
    return this.services.has(token);
  }

  dispose(): void {
    if (this.disposed) return;

    // Dispose singleton instances that implement IDisposable
    for (const descriptor of this.services.values()) {
      if (descriptor.instance && typeof descriptor.instance.dispose === 'function') {
        descriptor.instance.dispose();
      }
    }

    // Dispose scoped instances that implement IDisposable  
    for (const instance of this.scopedInstances.values()) {
      if (instance && typeof instance.dispose === 'function') {
        instance.dispose();
      }
    }

    this.services.clear();
    this.scopedInstances.clear();
    this.disposed = true;
  }

  private createInstance<T>(descriptor: ServiceDescriptor): T {
    switch (descriptor.lifetime) {
      case ServiceLifetime.Singleton:
        return this.createSingleton<T>(descriptor);

      case ServiceLifetime.Scoped:
        return this.createScoped<T>(descriptor);

      case ServiceLifetime.Transient:
      default:
        return this.createTransient<T>(descriptor);
    }
  }

  private createSingleton<T>(descriptor: ServiceDescriptor): T {
    if (!descriptor.instance) {
      descriptor.instance = this.createNew<T>(descriptor);
    }
    return descriptor.instance;
  }

  private createScoped<T>(descriptor: ServiceDescriptor): T {
    const existing = this.scopedInstances.get(descriptor.token);
    if (existing) {
      return existing;
    }

    const instance = this.createNew<T>(descriptor);
    this.scopedInstances.set(descriptor.token, instance);
    return instance;
  }

  private createTransient<T>(descriptor: ServiceDescriptor): T {
    return this.createNew<T>(descriptor);
  }

  private createNew<T>(descriptor: ServiceDescriptor): T {
    const { implementation } = descriptor;

    if (typeof implementation === 'function') {
      return implementation();
    }

    return implementation;
  }

  clearScope(): void {
    // Dispose scoped instances that implement IDisposable
    for (const instance of this.scopedInstances.values()) {
      if (instance && typeof instance.dispose === 'function') {
        instance.dispose();
      }
    }
    this.scopedInstances.clear();
  }
}

// Create global container instance
export const container = new DependencyContainer();
