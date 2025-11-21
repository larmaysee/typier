/**
 * Service Bindings Configuration
 * Defines all service registrations for the application
 */

import { container } from "./container";

// Import types and interfaces
import {
  IKeyboardLayoutRepository,
  ISessionRepository,
  ITypingRepository,
  IUserRepository,
} from "../../domain/interfaces/repositories";
import { DomainEvent, IEventBus } from "../../domain/interfaces/services";
import { ITextGenerationService } from "../../domain/interfaces/text-generation.interface";

// Import actual implementations
import { GetAvailableLayoutsUseCase } from "../../application/use-cases/keyboard-layouts/get-available-layouts";
import { SwitchKeyboardLayoutUseCase } from "../../application/use-cases/keyboard-layouts/switch-keyboard-layout";
import { CalculateUserStatisticsUseCase } from "../../application/use-cases/statistics/calculate-user-statistics";
import { CompleteTypingSessionUseCase } from "../../application/use-cases/typing/complete-typing-session";
import { ProcessTypingInputUseCase } from "../../application/use-cases/typing/process-typing-input";
import { StartTypingSessionUseCase } from "../../application/use-cases/typing/start-typing-session";

// Mock repositories for now (will be replaced in Phase 2)
import { MockKeyboardLayoutRepository } from "@/infrastructure/repositories/mock/mock-keyboard-layout.repository";
import { MockSessionRepository } from "@/infrastructure/repositories/mock/mock-session.repository";
import { MockStatisticsRepository } from "@/infrastructure/repositories/mock/mock-statistics.repository";
import { MockTypingRepository } from "@/infrastructure/repositories/mock/mock-typing.repository";
import { MockUserRepository } from "@/infrastructure/repositories/mock/mock-user.repository";

// Mock services for now (will be replaced in Phase 2)
import { MockAnalyticsService } from "@/infrastructure/services/mock/mock-analytics.service";
import { MockAppwriteClientService } from "@/infrastructure/services/mock/mock-appwrite-client.service";
import { MockLayoutValidatorService } from "@/infrastructure/services/mock/mock-layout-validator.service";
import { MockNotificationService } from "@/infrastructure/services/mock/mock-notification.service";
import { MockPerformanceTrackerService } from "@/infrastructure/services/mock/mock-performance-tracker.service";
import { MockStorageService } from "@/infrastructure/services/mock/mock-storage.service";
import { MockTextGenerationService } from "@/infrastructure/services/mock/mock-text-generation.service";

// Keyboard layout services
import { EnglishLayoutsService } from "@/infrastructure/services/keyboard-layouts/english-layouts.service";
import { LayoutManagerService } from "@/infrastructure/services/keyboard-layouts/layout-manager.service";
import { LayoutRegistryService } from "@/infrastructure/services/keyboard-layouts/layout-registry.service";
import { LisuLayoutsService } from "@/infrastructure/services/keyboard-layouts/lisu-layouts.service";
import { MyanmarLayoutsService } from "@/infrastructure/services/keyboard-layouts/myanmar-layouts.service";

// Service Tokens - following consistent naming convention
export const SERVICE_TOKENS = {
  // Repository Services
  TYPING_REPOSITORY: "TypingRepository",
  KEYBOARD_LAYOUT_REPOSITORY: "KeyboardLayoutRepository",
  USER_REPOSITORY: "UserRepository",
  STATISTICS_REPOSITORY: "StatisticsRepository",
  SESSION_REPOSITORY: "SessionRepository",

  // Application Use Cases
  START_TYPING_SESSION_USE_CASE: "StartTypingSessionUseCase",
  PROCESS_TYPING_INPUT_USE_CASE: "ProcessTypingInputUseCase",
  COMPLETE_TYPING_SESSION_USE_CASE: "CompleteTypingSessionUseCase",
  GET_AVAILABLE_LAYOUTS_USE_CASE: "GetAvailableLayoutsUseCase",
  SWITCH_KEYBOARD_LAYOUT_USE_CASE: "SwitchKeyboardLayoutUseCase",
  CALCULATE_USER_STATISTICS_USE_CASE: "CalculateUserStatisticsUseCase",

  // Infrastructure Services
  LAYOUT_MANAGER_SERVICE: "LayoutManagerService",
  TEXT_GENERATOR_SERVICE: "TextGeneratorService",
  PERFORMANCE_TRACKER_SERVICE: "PerformanceTrackerService",
  NOTIFICATION_SERVICE: "NotificationService",

  // Layout Providers by Language
  ENGLISH_LAYOUT_PROVIDER: "EnglishLayoutProvider",
  LISU_LAYOUT_PROVIDER: "LisuLayoutProvider",
  MYANMAR_LAYOUT_PROVIDER: "MyanmarLayoutProvider",
  LAYOUT_REGISTRY_SERVICE: "LayoutRegistryService",

  // External Services
  APPWRITE_CLIENT_SERVICE: "AppwriteClientService",
  STORAGE_SERVICE: "StorageService",
  ANALYTICS_SERVICE: "AnalyticsService",

  // Configuration Services
  ENVIRONMENT_CONFIG: "EnvironmentConfig",
  FEATURE_FLAGS: "FeatureFlags",

  // Validation Services
  LAYOUT_VALIDATOR_SERVICE: "LayoutValidatorService",
  INPUT_VALIDATOR_SERVICE: "InputValidatorService",

  // Logger Service
  LOGGER: "Logger",
} as const;

export type ServiceToken = (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS];

// Environment-specific configuration
export interface EnvironmentConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  appwriteEndpoint?: string;
  appwriteProjectId?: string;
  appwriteDatabaseId?: string;
  enableOfflineMode: boolean;
  enableAnalytics: boolean;
  debugLevel: "none" | "error" | "warn" | "info" | "debug";
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
  // Repository services using mock implementations for development
  container.registerSingleton(SERVICE_TOKENS.TYPING_REPOSITORY, () => new MockTypingRepository());
  container.registerSingleton(SERVICE_TOKENS.KEYBOARD_LAYOUT_REPOSITORY, () => new MockKeyboardLayoutRepository());
  container.registerSingleton(SERVICE_TOKENS.USER_REPOSITORY, () => new MockUserRepository());
  container.registerSingleton(SERVICE_TOKENS.SESSION_REPOSITORY, () => new MockSessionRepository());
  container.registerSingleton(SERVICE_TOKENS.STATISTICS_REPOSITORY, () => new MockStatisticsRepository());
}

export function registerUseCases(): void {
  // Application use cases using dependency injection
  container.registerTransient(SERVICE_TOKENS.START_TYPING_SESSION_USE_CASE, () => {
    const sessionRepo = container.resolve<ISessionRepository>(SERVICE_TOKENS.SESSION_REPOSITORY);
    const userRepo = container.resolve<IUserRepository>(SERVICE_TOKENS.USER_REPOSITORY);
    const layoutRepo = container.resolve<IKeyboardLayoutRepository>(SERVICE_TOKENS.KEYBOARD_LAYOUT_REPOSITORY);
    const textService = container.resolve<ITextGenerationService>(SERVICE_TOKENS.TEXT_GENERATOR_SERVICE);
    return new StartTypingSessionUseCase(sessionRepo, userRepo, layoutRepo, textService);
  });

  container.registerTransient(SERVICE_TOKENS.PROCESS_TYPING_INPUT_USE_CASE, () => {
    const sessionRepo = container.resolve<ISessionRepository>(SERVICE_TOKENS.SESSION_REPOSITORY);
    return new ProcessTypingInputUseCase(sessionRepo);
  });

  container.registerTransient(SERVICE_TOKENS.COMPLETE_TYPING_SESSION_USE_CASE, () => {
    const sessionRepo = container.resolve<ISessionRepository>(SERVICE_TOKENS.SESSION_REPOSITORY);
    const userRepo = container.resolve<IUserRepository>(SERVICE_TOKENS.USER_REPOSITORY);
    const typingRepo = container.resolve<ITypingRepository>(SERVICE_TOKENS.TYPING_REPOSITORY);
    return new CompleteTypingSessionUseCase(sessionRepo, typingRepo, userRepo);
  });

  // TODO: Add remaining use cases when their implementations are available
  container.registerTransient(SERVICE_TOKENS.GET_AVAILABLE_LAYOUTS_USE_CASE, () => {
    const layoutRepo = container.resolve<IKeyboardLayoutRepository>(SERVICE_TOKENS.KEYBOARD_LAYOUT_REPOSITORY);
    const userRepo = container.resolve<IUserRepository>(SERVICE_TOKENS.USER_REPOSITORY);
    return new GetAvailableLayoutsUseCase(layoutRepo, userRepo);
  });

  container.registerTransient(SERVICE_TOKENS.SWITCH_KEYBOARD_LAYOUT_USE_CASE, () => {
    const layoutRepo = container.resolve<IKeyboardLayoutRepository>(SERVICE_TOKENS.KEYBOARD_LAYOUT_REPOSITORY);
    const sessionRepo = container.resolve<ISessionRepository>(SERVICE_TOKENS.SESSION_REPOSITORY);
    // For now, create a simple event bus that logs events
    const mockEventBus: IEventBus = {
      publish: async (event: DomainEvent) => console.log("Event published:", event),
      subscribe: () => {},
      unsubscribe: () => {},
    };
    return new SwitchKeyboardLayoutUseCase(layoutRepo, sessionRepo, mockEventBus);
  });

  container.registerTransient(SERVICE_TOKENS.CALCULATE_USER_STATISTICS_USE_CASE, () => {
    const typingRepo = container.resolve<ITypingRepository>(SERVICE_TOKENS.TYPING_REPOSITORY);
    const userRepo = container.resolve<IUserRepository>(SERVICE_TOKENS.USER_REPOSITORY);
    return new CalculateUserStatisticsUseCase(typingRepo, userRepo);
  });
}

export function registerInfrastructureServices(): void {
  // Infrastructure services using mock implementations for development
  container.registerSingleton(SERVICE_TOKENS.TEXT_GENERATOR_SERVICE, () => new MockTextGenerationService());
  container.registerSingleton(SERVICE_TOKENS.PERFORMANCE_TRACKER_SERVICE, () => new MockPerformanceTrackerService());
  container.registerSingleton(SERVICE_TOKENS.NOTIFICATION_SERVICE, () => new MockNotificationService());
}

export function registerKeyboardLayoutServices(): void {
  // Keyboard layout providers and services - priority for Phase 1

  container.registerSingleton(SERVICE_TOKENS.ENGLISH_LAYOUT_PROVIDER, () => {
    return new EnglishLayoutsService();
  });

  container.registerSingleton(SERVICE_TOKENS.LISU_LAYOUT_PROVIDER, () => {
    return new LisuLayoutsService();
  });

  container.registerSingleton(SERVICE_TOKENS.MYANMAR_LAYOUT_PROVIDER, () => {
    return new MyanmarLayoutsService();
  });

  container.registerSingleton(SERVICE_TOKENS.LAYOUT_REGISTRY_SERVICE, () => {
    return new LayoutRegistryService();
  });

  container.registerSingleton(SERVICE_TOKENS.LAYOUT_MANAGER_SERVICE, () => {
    return new LayoutManagerService();
  });

  container.registerSingleton(SERVICE_TOKENS.LAYOUT_VALIDATOR_SERVICE, () => new MockLayoutValidatorService());
}

export function registerExternalServices(): void {
  // External service integrations
  container.registerSingleton(SERVICE_TOKENS.APPWRITE_CLIENT_SERVICE, () => new MockAppwriteClientService());
  container.registerSingleton(SERVICE_TOKENS.STORAGE_SERVICE, () => new MockStorageService());
  container.registerSingleton(SERVICE_TOKENS.ANALYTICS_SERVICE, () => new MockAnalyticsService());
}

// Helper functions to create default configurations
function createEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  return {
    isDevelopment,
    isProduction,
    appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
    appwriteDatabaseId: process.env.APPWRITE_DATABASE_ID,
    enableOfflineMode: !isProduction, // Enable offline mode in development by default
    enableAnalytics: isProduction, // Enable analytics only in production
    debugLevel: isDevelopment ? "debug" : "error",
  };
}

function createFeatureFlags(): FeatureFlags {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    enableMultipleLayouts: true, // Core feature
    enableCustomLayouts: isDevelopment, // Development feature for now
    enableCompetitionMode: false, // Future feature
    enableAnalytics: process.env.NODE_ENV === "production",
    enableOfflineSync: true, // Core feature
    enableKeyboardPreview: true, // Core feature
  };
}

function createLogger(): Console {
  // For now, return console. In the future, this can be replaced with a more sophisticated logger
  return console;
}

// Main initialization function
export function initializeContainer(): void {
  // Register services in correct order (dependencies first)
  registerCoreServices();
  registerRepositories();
  registerInfrastructureServices();
  registerUseCases();
  registerKeyboardLayoutServices();
  registerExternalServices();
}

// Auto-initialize container when module is imported
initializeContainer();
