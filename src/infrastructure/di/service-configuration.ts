import { container } from "./service-container";
import { ConsoleLogger } from "@/shared/utils/console-logger";
import { AppwriteDatabaseClient } from "../persistence/appwrite/database-client";
import { LocalStorageClient } from "../persistence/local-storage/storage-client";

// Repository implementations
import { AppwriteTypingRepository } from "../repositories/appwrite/appwrite-typing.repository";
import { AppwriteUserRepository } from "../repositories/appwrite/appwrite-user.repository";
import { AppwriteKeyboardLayoutRepository } from "../repositories/appwrite/appwrite-keyboard-layout.repository";
import { LocalTypingRepository } from "../repositories/local-storage/local-typing.repository";
import { LocalUserPreferencesRepository } from "../repositories/local-storage/local-user-preferences.repository";
import { LocalKeyboardLayoutRepository } from "../repositories/local-storage/local-keyboard-layout.repository";
import { HybridTypingRepository } from "../repositories/hybrid/hybrid-typing.repository";

// Types
import type { ILogger } from "@/shared/utils/logger";
import type { ITypingRepository, IUserRepository, IKeyboardLayoutRepository } from "@/domain/interfaces";

export function configureServices(): void {
  // Clear existing services
  container.clear();

  // Register logger
  container.register<ILogger>("Logger", new ConsoleLogger());

  // Register Appwrite client if configuration is available
  const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'typoria-db';

  if (appwriteEndpoint && appwriteProjectId) {
    container.registerFactory<AppwriteDatabaseClient>("AppwriteClient", () => {
      const logger = container.resolve<ILogger>("Logger");
      return new AppwriteDatabaseClient(
        {
          endpoint: appwriteEndpoint,
          projectId: appwriteProjectId,
          databaseId: appwriteDatabaseId
        },
        logger
      );
    });

    // Register Appwrite repositories
    container.registerFactory<AppwriteTypingRepository>("AppwriteTypingRepository", () => {
      const client = container.resolve<AppwriteDatabaseClient>("AppwriteClient");
      const logger = container.resolve<ILogger>("Logger");
      return new AppwriteTypingRepository(client, logger);
    });

    container.registerFactory<AppwriteUserRepository>("AppwriteUserRepository", () => {
      const client = container.resolve<AppwriteDatabaseClient>("AppwriteClient");
      const logger = container.resolve<ILogger>("Logger");
      return new AppwriteUserRepository(client, logger);
    });

    container.registerFactory<AppwriteKeyboardLayoutRepository>("AppwriteKeyboardLayoutRepository", () => {
      const client = container.resolve<AppwriteDatabaseClient>("AppwriteClient");
      const logger = container.resolve<ILogger>("Logger");
      return new AppwriteKeyboardLayoutRepository(client, logger);
    });
  }

  // Register LocalStorage client
  container.registerFactory<LocalStorageClient>("LocalStorageClient", () => {
    const logger = container.resolve<ILogger>("Logger");
    return new LocalStorageClient(
      {
        version: "1.0.0",
        keyPrefix: "typoria"
      },
      logger
    );
  });

  // Register LocalStorage repositories
  container.registerFactory<LocalTypingRepository>("LocalTypingRepository", () => {
    const storage = container.resolve<LocalStorageClient>("LocalStorageClient");
    const logger = container.resolve<ILogger>("Logger");
    return new LocalTypingRepository(storage, logger);
  });

  container.registerFactory<LocalUserPreferencesRepository>("LocalUserRepository", () => {
    const storage = container.resolve<LocalStorageClient>("LocalStorageClient");
    const logger = container.resolve<ILogger>("Logger");
    return new LocalUserPreferencesRepository(storage, logger);
  });

  container.registerFactory<LocalKeyboardLayoutRepository>("LocalKeyboardLayoutRepository", () => {
    const storage = container.resolve<LocalStorageClient>("LocalStorageClient");
    const logger = container.resolve<ILogger>("Logger");
    return new LocalKeyboardLayoutRepository(storage, logger);
  });

  // Register main repositories (Hybrid if Appwrite available, LocalStorage otherwise)
  container.registerFactory<ITypingRepository>("TypingRepository", () => {
    const logger = container.resolve<ILogger>("Logger");
    const localRepo = container.resolve<LocalTypingRepository>("LocalTypingRepository");
    const storage = container.resolve<LocalStorageClient>("LocalStorageClient");

    if (appwriteEndpoint && appwriteProjectId) {
      // Use hybrid repository
      const appwriteRepo = container.resolve<AppwriteTypingRepository>("AppwriteTypingRepository");
      return new HybridTypingRepository(appwriteRepo, localRepo, logger, storage);
    } else {
      // Use local repository only
      return localRepo;
    }
  });

  container.registerFactory<IUserRepository>("UserRepository", () => {
    if (appwriteEndpoint && appwriteProjectId) {
      return container.resolve<AppwriteUserRepository>("AppwriteUserRepository");
    } else {
      return container.resolve<LocalUserPreferencesRepository>("LocalUserRepository");
    }
  });

  container.registerFactory<IKeyboardLayoutRepository>("KeyboardLayoutRepository", () => {
    if (appwriteEndpoint && appwriteProjectId) {
      return container.resolve<AppwriteKeyboardLayoutRepository>("AppwriteKeyboardLayoutRepository");
    } else {
      return container.resolve<LocalKeyboardLayoutRepository>("LocalKeyboardLayoutRepository");
    }
  });
}

// Initialize services on module load
configureServices();