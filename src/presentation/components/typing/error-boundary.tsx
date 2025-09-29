"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("TypingContainer Error:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return (
        <DefaultErrorFallback error={this.state.error!} retry={this.retry} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto mb-2 text-red-500">
          ⚠️
        </div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
          Something went wrong
        </h3>
      </div>
      
      <p className="text-sm text-red-700 dark:text-red-300 text-center mb-4 max-w-md">
        {error.message || "An unexpected error occurred in the typing interface."}
      </p>
      
      <div className="flex gap-2">
        <button 
          onClick={retry}
          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}