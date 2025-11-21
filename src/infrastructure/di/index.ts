/**
 * Dependency Injection System - Public API
 * Entry point for accessing the dependency injection system
 */

// Core DI container
export {
  container,
  DependencyContainer,
  ServiceLifetime,
  type IDependencyContainer,
  type ServiceDescriptor,
} from "./container";

// Service bindings and tokens
export {
  registerCoreServices,
  registerKeyboardLayoutServices,
  registerRepositories,
  registerUseCases,
  SERVICE_TOKENS,
  type EnvironmentConfig,
  type FeatureFlags,
  type ServiceToken,
} from "./bindings";

// Service provider and factory
export {
  registerServicesForEnvironment,
  ServiceFactory,
  ServiceProvider,
  type ServiceHealthReport,
  type ServiceRegistrationOptions,
  type ServiceStatus,
} from "./providers";
