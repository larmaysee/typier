/**
 * React Hook for Dependency Injection
 * Provides easy access to services within React components
 */

import { SERVICE_TOKENS } from "@/infrastructure/di/bindings";
import { container } from "@/infrastructure/di/container";
import { ServiceFactory } from "@/infrastructure/di/providers";
import { DependencyInjectionContext } from "@/presentation/providers/dependency-injection.provider";
import { useContext } from "react";

export interface DependencyInjectionHook {
  container: typeof container;
  resolve: <T>(token: string) => T;
  tryResolve: <T>(token: string) => T | null;
  isRegistered: (token: string) => boolean;
  serviceTokens: typeof SERVICE_TOKENS;
}

/**
 * Hook to access dependency injection container in React components
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { resolve, serviceTokens } = useDependencyInjection();
 *
 *   const layoutManager = resolve<ILayoutManagerService>(serviceTokens.LAYOUT_MANAGER_SERVICE);
 *
 *   // Use the service...
 * }
 * ```
 */
export function useDependencyInjection(): DependencyInjectionHook {
  const context = useContext(DependencyInjectionContext);

  if (!context) {
    throw new Error(
      "useDependencyInjection must be used within a DependencyInjectionProvider. " +
        "Make sure to wrap your app with <DependencyInjectionProvider>."
    );
  }

  return {
    container: context.container,
    resolve: <T>(token: string): T => {
      try {
        return ServiceFactory.create<T>(token);
      } catch (error) {
        throw new Error(
          `Failed to resolve service '${token}': ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    tryResolve: <T>(token: string): T | null => {
      return ServiceFactory.tryCreate<T>(token);
    },
    isRegistered: (token: string): boolean => {
      return context.container.isRegistered(token);
    },
    serviceTokens: SERVICE_TOKENS,
  };
}

/**
 * Hook to resolve a specific service type-safely
 *
 * @example
 * ```tsx
 * function TypingComponent() {
 *   const layoutManager = useService<ILayoutManagerService>('LayoutManagerService');
 *
 *   // Use layoutManager...
 * }
 * ```
 */
export function useService<T>(token: string): T {
  const { resolve } = useDependencyInjection();
  return resolve<T>(token);
}

/**
 * Hook to optionally resolve a service (returns null if not available)
 *
 * @example
 * ```tsx
 * function OptionalFeatureComponent() {
 *   const analyticsService = useOptionalService<IAnalyticsService>('AnalyticsService');
 *
 *   if (analyticsService) {
 *     // Use analytics service...
 *   }
 * }
 * ```
 */
export function useOptionalService<T>(token: string): T | null {
  const { tryResolve } = useDependencyInjection();
  return tryResolve<T>(token);
}

/**
 * Hook to resolve multiple services at once
 *
 * @example
 * ```tsx
 * function ComplexComponent() {
 *   const services = useServices({
 *     layoutManager: SERVICE_TOKENS.LAYOUT_MANAGER_SERVICE,
 *     textGenerator: SERVICE_TOKENS.TEXT_GENERATOR_SERVICE,
 *     analytics: SERVICE_TOKENS.ANALYTICS_SERVICE
 *   });
 *
 *   // Use services.layoutManager, services.textGenerator, etc.
 * }
 * ```
 */
export function useServices<T extends Record<string, unknown>>(tokens: Record<keyof T, string>): T {
  const { resolve } = useDependencyInjection();

  const services = {} as T;

  for (const [key, token] of Object.entries(tokens)) {
    services[key as keyof T] = resolve(token);
  }

  return services;
}

/**
 * Hook for development/debugging - gets health report of all services
 */
export function useServiceHealthReport() {
  return async () => {
    const { ServiceProvider } = await import("@/infrastructure/di/providers");
    return ServiceProvider.healthCheck();
  };
}
