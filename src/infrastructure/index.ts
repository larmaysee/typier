// Main infrastructure exports
export { container } from './di/service-container';
export { configureServices } from './di/service-configuration';

// Export repository implementations for direct use if needed
export { AppwriteTypingRepository } from './repositories/appwrite/appwrite-typing.repository';
export { AppwriteUserRepository } from './repositories/appwrite/appwrite-user.repository';
export { AppwriteKeyboardLayoutRepository } from './repositories/appwrite/appwrite-keyboard-layout.repository';

export { LocalTypingRepository } from './repositories/local-storage/local-typing.repository';
export { LocalUserPreferencesRepository } from './repositories/local-storage/local-user-preferences.repository';
export { LocalKeyboardLayoutRepository } from './repositories/local-storage/local-keyboard-layout.repository';

export { HybridTypingRepository } from './repositories/hybrid/hybrid-typing.repository';

// Export persistence clients
export { AppwriteDatabaseClient } from './persistence/appwrite/database-client';
export { LocalStorageClient } from './persistence/local-storage/storage-client';

// Export configuration types
export type { AppwriteConfig } from './persistence/appwrite/database-client';
export type { StorageConfig } from './persistence/local-storage/storage-client';