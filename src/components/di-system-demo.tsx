/**
 * Demo Component to test Dependency Injection System
 * This validates that the DI system works correctly
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useDependencyInjection, useService } from '@/presentation';
import { SERVICE_TOKENS, EnvironmentConfig, FeatureFlags, ServiceHealthReport } from '@/infrastructure/di';

export function DISystemDemo() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing dependency injection system...</p>
        </div>
      </div>
    );
  }

  return <DISystemDemoContent />;
}

function DISystemDemoContent() {
  const { container, isRegistered, serviceTokens } = useDependencyInjection();
  const [healthReport, setHealthReport] = useState<ServiceHealthReport | null>(null);

  // Try to resolve core services
  const envConfig = useService<EnvironmentConfig>(SERVICE_TOKENS.ENVIRONMENT_CONFIG);
  const featureFlags = useService<FeatureFlags>(SERVICE_TOKENS.FEATURE_FLAGS);
  const logger = useService<Console>(SERVICE_TOKENS.LOGGER);

  useEffect(() => {
    // Get health report
    import('@/infrastructure/di/providers').then(({ ServiceProvider }) => {
      ServiceProvider.healthCheck().then(setHealthReport);
    });
  }, []);

  const registeredServices = Object.entries(serviceTokens).filter(([, token]) => 
    isRegistered(token)
  );

  const unregisteredServices = Object.entries(serviceTokens).filter(([, token]) => 
    !isRegistered(token)
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dependency Injection System Status</h1>
      
      {/* Environment Configuration */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Environment:</span> {envConfig.isDevelopment ? 'Development' : envConfig.isProduction ? 'Production' : 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Debug Level:</span> {envConfig.debugLevel}
          </div>
          <div>
            <span className="font-medium">Offline Mode:</span> {envConfig.enableOfflineMode ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <span className="font-medium">Analytics:</span> {envConfig.enableAnalytics ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(featureFlags).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                value ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Services */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Registered Services ({registeredServices.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {registeredServices.map(([name, token]) => (
            <div key={name} className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span className="font-mono">{token}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unregistered Services */}
      <div className="mb-8 p-6 bg-yellow-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Unregistered Services ({unregisteredServices.length})</h2>
        <p className="text-sm text-gray-600 mb-4">
          These services are defined but not yet implemented (expected for Phase 1):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {unregisteredServices.map(([name, token]) => (
            <div key={name} className="flex items-center">
              <span className="text-yellow-600 mr-2">⏳</span>
              <span className="font-mono">{token}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Report */}
      {healthReport && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Health Report</h2>
          <div className="mb-4">
            <span className="font-medium">Overall Status:</span>
            <span className={`ml-2 px-3 py-1 rounded ${
              healthReport.isHealthy ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {healthReport.isHealthy ? 'Healthy' : 'Issues Found'}
            </span>
          </div>
          <div className="mb-4">
            <span className="font-medium">Timestamp:</span> {healthReport.timestamp.toLocaleString()}
          </div>
          {healthReport.errors.length > 0 && (
            <div>
              <span className="font-medium text-red-600">Errors:</span>
              <ul className="mt-2 text-sm">
                {healthReport.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-600">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Test Actions */}
      <div className="p-6 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <button
            onClick={() => logger.info('DI System test log from demo component')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Logger Service
          </button>
          
          <button
            onClick={() => {
              logger.group('DI System Information');
              logger.info('Environment:', envConfig);
              logger.info('Feature Flags:', featureFlags);
              logger.info('Container instance:', container);
              logger.groupEnd();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
          >
            Log System Information
          </button>
        </div>
      </div>
    </div>
  );
}