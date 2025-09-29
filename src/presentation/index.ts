/**
 * Presentation Layer - Public API
 * Entry point for React hooks and providers
 */

// Hooks
export {
  useDependencyInjection,
  useService,
  useOptionalService,
  useServices,
  useServiceHealthReport,
  type DependencyInjectionHook
} from './hooks/core/use-dependency-injection';

// Providers
export {
  DependencyInjectionProvider,
  DependencyInjectionContext,
  DIErrorBoundary,
  type DependencyInjectionProviderProps,
  type DependencyInjectionContextValue,
  type DIErrorBoundaryProps
} from './providers/dependency-injection.provider';

export {
  AppProviders,
  DevAppProviders,
  ProdAppProviders,
  TestAppProviders,
  getEnvironmentProviders,
  type AppProvidersProps
} from './providers/app-providers';