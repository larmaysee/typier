/**
 * Dependency Injection Provider for React Components
 * Provides DI container context to the React component tree
 */

'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { container } from '@/infrastructure/di/container';
import { ServiceProvider, ServiceRegistrationOptions } from '@/infrastructure/di/providers';

export interface DependencyInjectionContextValue {
  container: typeof container;
  isInitialized: boolean;
  initializationError: Error | null;
}

export const DependencyInjectionContext = createContext<DependencyInjectionContextValue | null>(null);

export interface DependencyInjectionProviderProps {
  children: ReactNode;
  options?: ServiceRegistrationOptions;
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Provider that initializes and provides the dependency injection container
 * Should be placed at the root of your React application
 */
export function DependencyInjectionProvider({ 
  children, 
  options = {},
  onInitialized,
  onError
}: DependencyInjectionProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  useEffect(() => {
    initializeServices();

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        container.dispose();
      }
    };
  }, []);

  const initializeServices = async () => {
    try {
      setInitializationError(null);
      
      // Don't re-initialize if already initialized
      if (ServiceProvider.isInitialized) {
        setIsInitialized(true);
        onInitialized?.();
        return;
      }

      // Initialize the service provider with options
      ServiceProvider.initialize(options);
      
      setIsInitialized(true);
      onInitialized?.();
      
    } catch (error) {
      const initError = error instanceof Error ? error : new Error('Failed to initialize services');
      setInitializationError(initError);
      onError?.(initError);
      console.error('Failed to initialize dependency injection system:', initError);
    }
  };

  const contextValue: DependencyInjectionContextValue = {
    container,
    isInitialized,
    initializationError
  };

  return (
    <DependencyInjectionContext.Provider value={contextValue}>
      {children}
    </DependencyInjectionContext.Provider>
  );
}

/**
 * Error boundary component for handling DI initialization errors
 */
export interface DIErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface DIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DIErrorBoundary extends React.Component<DIErrorBoundaryProps, DIErrorBoundaryState> {
  constructor(props: DIErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DIErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dependency injection error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-red-500 mr-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800">Service Initialization Error</h3>
            </div>
            <p className="text-red-700 mb-4">
              Failed to initialize application services. Please try refreshing the page.
            </p>
            <p className="text-sm text-red-600 mb-4 font-mono">
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}