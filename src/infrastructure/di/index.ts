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
  type ServiceDescriptor 
} from './container';

// Service bindings and tokens
export { 
  SERVICE_TOKENS,
  registerCoreServices,
  registerRepositories,
  registerUseCases,
  registerInfrastructureServices,
  registerKeyboardLayoutServices,
  registerExternalServices,
  type ServiceToken,
  type EnvironmentConfig,
  type FeatureFlags
} from './bindings';

// Service provider and factory
export { 
  ServiceProvider,
  ServiceFactory,
  registerServicesForEnvironment,
  type ServiceRegistrationOptions,
  type ServiceStatus,
  type ServiceHealthReport
} from './providers';