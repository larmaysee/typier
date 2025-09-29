/**
 * App Providers - Composition Root
 * Combines all providers needed for the application
 */

'use client';

import React, { ReactNode } from 'react';
import { DependencyInjectionProvider, DIErrorBoundary } from './dependency-injection.provider';
import { ServiceRegistrationOptions } from '@/infrastructure/di/providers';

export interface AppProvidersProps {
  children: ReactNode;
  diOptions?: ServiceRegistrationOptions;
}

/**
 * Root provider component that wraps the entire application
 * Combines DI provider with error boundary and other necessary providers
 */
export function AppProviders({ children, diOptions }: AppProvidersProps) {
  const handleDIInitialized = () => {
    console.info('🚀 Dependency injection system ready');
  };

  const handleDIError = (error: Error) => {
    console.error('❌ Dependency injection initialization failed:', error);
  };

  return (
    <DIErrorBoundary>
      <DependencyInjectionProvider
        options={diOptions}
        onInitialized={handleDIInitialized}
        onError={handleDIError}
      >
        {children}
      </DependencyInjectionProvider>
    </DIErrorBoundary>
  );
}

/**
 * Development-specific providers with enhanced debugging
 */
export function DevAppProviders({ children, diOptions }: AppProvidersProps) {
  const devDiOptions: ServiceRegistrationOptions = {
    environment: 'development',
    enableRepositories: true,
    enableUseCases: true,
    enableInfrastructureServices: true,
    enableKeyboardLayoutServices: true,
    enableExternalServices: true,
    ...diOptions
  };

  return (
    <AppProviders diOptions={devDiOptions}>
      {children}
    </AppProviders>
  );
}

/**
 * Production-specific providers with optimized settings
 */
export function ProdAppProviders({ children, diOptions }: AppProvidersProps) {
  const prodDiOptions: ServiceRegistrationOptions = {
    environment: 'production',
    enableRepositories: true,
    enableUseCases: true,
    enableInfrastructureServices: true,
    enableKeyboardLayoutServices: true,
    enableExternalServices: true,
    ...diOptions
  };

  return (
    <AppProviders diOptions={prodDiOptions}>
      {children}
    </AppProviders>
  );
}

/**
 * Test-specific providers with minimal services for testing
 */
export function TestAppProviders({ children, diOptions }: AppProvidersProps) {
  const testDiOptions: ServiceRegistrationOptions = {
    environment: 'test',
    enableRepositories: false, // Use mock repositories in tests
    enableUseCases: true,
    enableInfrastructureServices: false, // Use mock services in tests
    enableKeyboardLayoutServices: true,
    enableExternalServices: false, // No external services in tests
    ...diOptions
  };

  return (
    <AppProviders diOptions={testDiOptions}>
      {children}
    </AppProviders>
  );
}

/**
 * Get the appropriate providers based on environment
 */
export function getEnvironmentProviders(): React.ComponentType<AppProvidersProps> {
  const environment = process.env.NODE_ENV;
  
  switch (environment) {
    case 'production':
      return ProdAppProviders;
    case 'test':
      return TestAppProviders;
    case 'development':
    default:
      return DevAppProviders;
  }
}