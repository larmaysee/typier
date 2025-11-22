// Simple service container for dependency injection
export class ServiceContainer {
  private services = new Map<string, unknown>();
  private factories = new Map<string, () => unknown>();

  // Register a singleton service
  register<T>(name: string, instance: T): void {
    this.services.set(name, instance);
  }

  // Register a factory function
  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  // Resolve a service
  resolve<T>(name: string): T {
    // Check if we have an instance already
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    // Check if we have a factory
    if (this.factories.has(name)) {
      const factory = this.factories.get(name)!;
      const instance = factory();
      this.services.set(name, instance); // Cache the instance
      return instance as T;
    }

    throw new Error(`Service not found: ${name}`);
  }

  // Check if a service is registered
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  // Clear all services (useful for testing)
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

// Global container instance
export const container = new ServiceContainer();
