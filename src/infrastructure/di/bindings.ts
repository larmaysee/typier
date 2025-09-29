/**
 * Service Bindings Configuration
 * Defines all service registrations for the application
 */

import { container, ServiceLifetime } from './container';

// Service Tokens - following consistent naming convention
export const SERVICE_TOKENS = {
  // Repository Services
  TYPING_REPOSITORY: 'TypingRepository',
  KEYBOARD_LAYOUT_REPOSITORY: 'KeyboardLayoutRepository', 
  USER_REPOSITORY: 'UserRepository',
  STATISTICS_REPOSITORY: 'StatisticsRepository',

  // Application Use Cases
  START_TYPING_SESSION_USE_CASE: 'StartTypingSessionUseCase',
  PROCESS_TYPING_INPUT_USE_CASE: 'ProcessTypingInputUseCase', 
  COMPLETE_TYPING_SESSION_USE_CASE: 'CompleteTypingSessionUseCase',
  GET_AVAILABLE_LAYOUTS_USE_CASE: 'GetAvailableLayoutsUseCase',
  SWITCH_KEYBOARD_LAYOUT_USE_CASE: 'SwitchKeyboardLayoutUseCase',
  CALCULATE_USER_STATISTICS_USE_CASE: 'CalculateUserStatisticsUseCase',

  // Infrastructure Services
  LAYOUT_MANAGER_SERVICE: 'LayoutManagerService',
  TEXT_GENERATOR_SERVICE: 'TextGeneratorService',
  PERFORMANCE_TRACKER_SERVICE: 'PerformanceTrackerService',
  NOTIFICATION_SERVICE: 'NotificationService',

  // Layout Providers by Language
  ENGLISH_LAYOUT_PROVIDER: 'EnglishLayoutProvider',
  LISU_LAYOUT_PROVIDER: 'LisuLayoutProvider',
  MYANMAR_LAYOUT_PROVIDER: 'MyanmarLayoutProvider',
  LAYOUT_REGISTRY_SERVICE: 'LayoutRegistryService',

  // External Services
  APPWRITE_CLIENT_SERVICE: 'AppwriteClientService',
  STORAGE_SERVICE: 'StorageService',
  ANALYTICS_SERVICE: 'AnalyticsService',

  // Configuration Services
  ENVIRONMENT_CONFIG: 'EnvironmentConfig',
  FEATURE_FLAGS: 'FeatureFlags',
  
  // Validation Services
  LAYOUT_VALIDATOR_SERVICE: 'LayoutValidatorService',
  INPUT_VALIDATOR_SERVICE: 'InputValidatorService',

  // Logger Service
  LOGGER: 'Logger'
} as const;

export type ServiceToken = typeof SERVICE_TOKENS[keyof typeof SERVICE_TOKENS];

// Environment-specific configuration
export interface EnvironmentConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  appwriteEndpoint?: string;
  appwriteProjectId?: string;
  appwriteDatabaseId?: string;
  enableOfflineMode: boolean;
  enableAnalytics: boolean;
  debugLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

// Feature flags configuration
export interface FeatureFlags {
  enableMultipleLayouts: boolean;
  enableCustomLayouts: boolean;
  enableCompetitionMode: boolean;
  enableAnalytics: boolean;
  enableOfflineSync: boolean;
  enableKeyboardPreview: boolean;
}

// Service registration functions
export function registerCoreServices(): void {
  // Environment Configuration
  container.registerSingleton(SERVICE_TOKENS.ENVIRONMENT_CONFIG, () => createEnvironmentConfig());
  
  // Feature Flags
  container.registerSingleton(SERVICE_TOKENS.FEATURE_FLAGS, () => createFeatureFlags());
  
  // Logger Service
  container.registerSingleton(SERVICE_TOKENS.LOGGER, () => createLogger());
}

export function registerRepositories(): void {
  // Repository services will be registered based on environment
  // For now, we'll register placeholders that can be replaced with actual implementations
  
  // Note: These will be replaced with actual repository implementations in Phase 2
  container.registerSingleton(SERVICE_TOKENS.TYPING_REPOSITORY, () => {
    throw new Error('Typing repository not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.KEYBOARD_LAYOUT_REPOSITORY, () => {
    throw new Error('Keyboard layout repository not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.USER_REPOSITORY, () => {
    throw new Error('User repository not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.STATISTICS_REPOSITORY, () => {
    throw new Error('Statistics repository not implemented yet');
  });
}

export function registerUseCases(): void {
  // Application use cases - placeholders for Phase 3
  // These will be implemented once we have the domain and repository layers
  
  container.registerTransient(SERVICE_TOKENS.START_TYPING_SESSION_USE_CASE, () => {
    throw new Error('StartTypingSessionUseCase not implemented yet');
  });
  
  container.registerTransient(SERVICE_TOKENS.PROCESS_TYPING_INPUT_USE_CASE, () => {
    throw new Error('ProcessTypingInputUseCase not implemented yet');
  });
  
  container.registerTransient(SERVICE_TOKENS.COMPLETE_TYPING_SESSION_USE_CASE, () => {
    throw new Error('CompleteTypingSessionUseCase not implemented yet');
  });
  
  container.registerTransient(SERVICE_TOKENS.GET_AVAILABLE_LAYOUTS_USE_CASE, () => {
    throw new Error('GetAvailableLayoutsUseCase not implemented yet');
  });
  
  container.registerTransient(SERVICE_TOKENS.SWITCH_KEYBOARD_LAYOUT_USE_CASE, () => {
    throw new Error('SwitchKeyboardLayoutUseCase not implemented yet');
  });
  
  container.registerTransient(SERVICE_TOKENS.CALCULATE_USER_STATISTICS_USE_CASE, () => {
    throw new Error('CalculateUserStatisticsUseCase not implemented yet');
  });
}

export function registerInfrastructureServices(): void {
  // Infrastructure services - placeholders for Phase 2
  
  container.registerSingleton(SERVICE_TOKENS.LAYOUT_MANAGER_SERVICE, () => {
    throw new Error('LayoutManagerService not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.TEXT_GENERATOR_SERVICE, () => {
    throw new Error('TextGeneratorService not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.PERFORMANCE_TRACKER_SERVICE, () => {
    throw new Error('PerformanceTrackerService not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.NOTIFICATION_SERVICE, () => {
    throw new Error('NotificationService not implemented yet');
  });
}

export function registerKeyboardLayoutServices(): void {
  // Keyboard layout providers and services - priority for Phase 1
  
  container.registerSingleton(SERVICE_TOKENS.ENGLISH_LAYOUT_PROVIDER, () => {
    throw new Error('EnglishLayoutProvider not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.LISU_LAYOUT_PROVIDER, () => {
    throw new Error('LisuLayoutProvider not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.MYANMAR_LAYOUT_PROVIDER, () => {
    throw new Error('MyanmarLayoutProvider not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.LAYOUT_REGISTRY_SERVICE, () => {
    throw new Error('LayoutRegistryService not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.LAYOUT_VALIDATOR_SERVICE, () => {
    throw new Error('LayoutValidatorService not implemented yet');
  });
}

export function registerExternalServices(): void {
  // External service integrations
  
  container.registerSingleton(SERVICE_TOKENS.APPWRITE_CLIENT_SERVICE, () => {
    throw new Error('AppwriteClientService not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.STORAGE_SERVICE, () => {
    throw new Error('StorageService not implemented yet');
  });
  
  container.registerSingleton(SERVICE_TOKENS.ANALYTICS_SERVICE, () => {
    throw new Error('AnalyticsService not implemented yet');
  });
}

// Helper functions to create default configurations
function createEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    isDevelopment,
    isProduction,
    appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    appwriteDatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    enableOfflineMode: !isProduction, // Enable offline mode in development by default
    enableAnalytics: isProduction, // Enable analytics only in production
    debugLevel: isDevelopment ? 'debug' : 'error'
  };
}

function createFeatureFlags(): FeatureFlags {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    enableMultipleLayouts: true, // Core feature
    enableCustomLayouts: isDevelopment, // Development feature for now
    enableCompetitionMode: false, // Future feature
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableOfflineSync: true, // Core feature
    enableKeyboardPreview: true // Core feature
  };
}

function createLogger(): Console {
  // For now, return console. In the future, this can be replaced with a more sophisticated logger
  return console;
}