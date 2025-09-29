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