/**
 * Provider Registration and Factory Methods
 * Handles service registration and provides factory patterns for service creation
 */

import {
  EnvironmentConfig,
  registerCoreServices,
  registerKeyboardLayoutServices,
  registerRepositories,
  registerUseCases,
  SERVICE_TOKENS,
} from "./bindings";
import { container } from "./container";

export interface ServiceRegistrationOptions {
  enableRepositories?: boolean;
  enableUseCases?: boolean;
  enableInfrastructureServices?: boolean;
  enableKeyboardLayoutServices?: boolean;
  enableExternalServices?: boolean;
  environment?: "development" | "production" | "test";
}

export class ServiceProvider {
  private static initialized = false;
  private static registrationOptions: ServiceRegistrationOptions = {};

  /**
   * Initialize all services with the dependency injection container
   */
  static initialize(options: ServiceRegistrationOptions = {}): void {
    if (this.initialized) {
      console.warn("ServiceProvider has already been initialized");
      return;
    }

    this.registrationOptions = {
      enableRepositories: true,
      enableUseCases: true,
      enableInfrastructureServices: true,
      enableKeyboardLayoutServices: true,
      enableExternalServices: true,
      environment: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
      ...options,
    };

    try {
      this.registerAllServices();
      this.validateCriticalServices();
      this.initialized = true;

      console.info("✅ Dependency injection system initialized successfully");
      this.logRegisteredServices();
    } catch (error) {
      console.error("❌ Failed to initialize dependency injection system:", error);
      throw error;
    }
  }

  /**
   * Register all service categories based on options
   */
  private static registerAllServices(): void {
    const { enableRepositories, enableUseCases, enableKeyboardLayoutServices } = this.registrationOptions;

    // Always register core services
    registerCoreServices();

    if (enableRepositories) {
      registerRepositories();
    }

    if (enableUseCases) {
      registerUseCases();
    }

    if (enableKeyboardLayoutServices) {
      registerKeyboardLayoutServices();
    }
  }

  /**
   * Validate that critical services are registered and accessible
   */
  private static validateCriticalServices(): void {
    const criticalServices = [SERVICE_TOKENS.ENVIRONMENT_CONFIG, SERVICE_TOKENS.FEATURE_FLAGS, SERVICE_TOKENS.LOGGER];

    for (const token of criticalServices) {
      if (!container.isRegistered(token)) {
        throw new Error(`Critical service '${token}' is not registered`);
      }

      try {
        container.resolve(token);
      } catch (error) {
        throw new Error(`Critical service '${token}' cannot be resolved: ${error}`);
      }
    }
  }

  /**
   * Log registered services for debugging
   */
  private static logRegisteredServices(): void {
    const envConfig = container.resolve<EnvironmentConfig>(SERVICE_TOKENS.ENVIRONMENT_CONFIG);

    if (envConfig.debugLevel === "debug") {
      console.group("🔧 Registered Services");

      const serviceCategories = [
        {
          name: "Core Services",
          tokens: [SERVICE_TOKENS.ENVIRONMENT_CONFIG, SERVICE_TOKENS.FEATURE_FLAGS, SERVICE_TOKENS.LOGGER],
        },
        { name: "Repository Services", tokens: Object.values(SERVICE_TOKENS).filter((t) => t.includes("Repository")) },
        { name: "Use Case Services", tokens: Object.values(SERVICE_TOKENS).filter((t) => t.includes("UseCase")) },
        {
          name: "Infrastructure Services",
          tokens: Object.values(SERVICE_TOKENS).filter((t) => t.includes("Service") && !t.includes("UseCase")),
        },
        {
          name: "Layout Services",
          tokens: Object.values(SERVICE_TOKENS).filter((t) => t.includes("Layout") || t.includes("Provider")),
        },
      ];

      for (const category of serviceCategories) {
        if (category.tokens.length > 0) {
          console.group(`📁 ${category.name}`);
          for (const token of category.tokens) {
            const status = container.isRegistered(token) ? "✅" : "❌";
            console.log(`${status} ${token}`);
          }
          console.groupEnd();
        }
      }

      console.groupEnd();
    }
  }

  /**
   * Perform health check on registered services
   */
  static healthCheck(): Promise<ServiceHealthReport> {
    return Promise.resolve().then(() => {
      const report: ServiceHealthReport = {
        isHealthy: true,
        timestamp: new Date(),
        services: [],
        errors: [],
      };

      // Check all registered services
      const allTokens = Object.values(SERVICE_TOKENS);

      for (const token of allTokens) {
        const serviceStatus: ServiceStatus = {
          token,
          isRegistered: container.isRegistered(token),
          canResolve: false,
          error: null,
        };

        if (serviceStatus.isRegistered) {
          try {
            container.resolve(token);
            serviceStatus.canResolve = true;
          } catch (error) {
            serviceStatus.canResolve = false;
            serviceStatus.error = error instanceof Error ? error.message : "Unknown error";
            report.errors.push(`Service '${token}' cannot be resolved: ${serviceStatus.error}`);
            report.isHealthy = false;
          }
        } else {
          // Not registered might be expected for some services in different phases
          serviceStatus.error = "Not registered";
        }

        report.services.push(serviceStatus);
      }

      return report;
    });
  }

  /**
   * Reset the service provider (mainly for testing)
   */
  static reset(): void {
    container.dispose();
    this.initialized = false;
    this.registrationOptions = {};
  }

  /**
   * Get initialization status
   */
  static get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current registration options
   */
  static get currentOptions(): ServiceRegistrationOptions {
    return { ...this.registrationOptions };
  }
}

// Health check interfaces
export interface ServiceStatus {
  token: string;
  isRegistered: boolean;
  canResolve: boolean;
  error: string | null;
}

export interface ServiceHealthReport {
  isHealthy: boolean;
  timestamp: Date;
  services: ServiceStatus[];
  errors: string[];
}

// Factory pattern for common service creation
export class ServiceFactory {
  /**
   * Create a service with dependency injection
   */
  static create<T>(token: string): T {
    if (!ServiceProvider.isInitialized) {
      throw new Error("ServiceProvider must be initialized before creating services");
    }
    return container.resolve<T>(token);
  }

  /**
   * Create multiple services at once
   */
  static createBatch<T extends Record<string, unknown>>(tokens: Record<keyof T, string>): T {
    const result = {} as T;

    for (const [key, token] of Object.entries(tokens)) {
      result[key as keyof T] = container.resolve(token);
    }

    return result;
  }

  /**
   * Try to create a service, return null if not available
   */
  static tryCreate<T>(token: string): T | null {
    try {
      return container.resolve<T>(token);
    } catch {
      return null;
    }
  }
}

// Environment-specific service registration
export function registerServicesForEnvironment(environment: "development" | "production" | "test"): void {
  const options: ServiceRegistrationOptions = {
    environment,
    enableRepositories: true,
    enableUseCases: true,
    enableInfrastructureServices: true,
    enableKeyboardLayoutServices: true,
    enableExternalServices: environment !== "test", // Don't register external services in test environment
  };

  ServiceProvider.initialize(options);
}
