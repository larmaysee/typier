# Infrastructure Layer - Repository Pattern with Offline Support

This directory contains the implementation of Phase 2 of the Typoria Clean Architecture refactoring plan, implementing the Infrastructure Layer with Repository Pattern supporting Appwrite cloud database, localStorage fallback, and hybrid offline/online operation.

## 🏗️ Architecture Overview

The infrastructure layer implements the Repository Pattern with three key strategies:

1. **Appwrite Repositories** - Cloud-based data persistence
2. **LocalStorage Repositories** - Offline data persistence
3. **Hybrid Repositories** - Seamless online/offline operation

## 📁 Directory Structure

```
src/infrastructure/
├── repositories/
│   ├── appwrite/                    # Cloud database repositories
│   │   ├── appwrite-typing.repository.ts
│   │   ├── appwrite-user.repository.ts
│   │   └── appwrite-keyboard-layout.repository.ts
│   ├── local-storage/               # Offline repositories
│   │   ├── local-typing.repository.ts
│   │   ├── local-user-preferences.repository.ts
│   │   └── local-keyboard-layout.repository.ts
│   └── hybrid/                      # Hybrid online/offline repositories
│       └── hybrid-typing.repository.ts
├── persistence/                     # Database clients & configuration
│   ├── appwrite/
│   │   ├── database-client.ts       # Appwrite SDK wrapper
│   │   └── collections.config.ts   # Database schemas
│   └── local-storage/
│       └── storage-client.ts        # LocalStorage abstraction
├── di/                             # Dependency injection
│   ├── service-container.ts        # Simple DI container
│   └── service-configuration.ts    # Service registration
└── examples/                       # Usage examples
    └── usage-example.ts            # How to use the repositories
```

## 🔧 Key Features

### Hybrid Repository Pattern

The `HybridTypingRepository` provides:

- **Dual Write**: Always saves to localStorage first, then attempts Appwrite
- **Intelligent Fallback**: Tries Appwrite first, falls back to localStorage
- **Background Sync**: Queues failed operations for retry when online
- **Conflict Resolution**: Merges data from multiple sources intelligently

### Offline Support Strategy

- **Practice Mode**: Full offline functionality (no cloud sync)
- **Normal Mode**: Queue for sync when offline
- **Competition Mode**: Requires online connectivity
- **Data Versioning**: Handles schema changes and migration

### Error Handling & Resilience

- **Circuit Breaker Pattern**: Fails fast when Appwrite unavailable
- **Exponential Backoff**: Retry failed operations with increasing delays
- **Graceful Degradation**: App works without backend connectivity
- **Type-Safe Errors**: Custom domain error types

## 🚀 Quick Start

### 1. Import and Configure

```typescript
import { container, configureServices } from "@/infrastructure";

// Configure services (automatically detects Appwrite availability)
configureServices();
```

### 2. Use Repositories

```typescript
import type { ITypingRepository } from "@/domain/interfaces";

// Resolve repository from DI container
const typingRepository = container.resolve<ITypingRepository>("TypingRepository");

// Save a typing test (works offline)
await typingRepository.save({
  id: "test-123",
  userId: "user-456",
  mode: "normal",
  // ... other properties
});

// Get user tests (hybrid online/offline)
const tests = await typingRepository.getUserTests("user-456");
```

### 3. Environment Configuration

Set these environment variables for Appwrite integration:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_DATABASE_ID=typoria-db
```

Without these variables, the app automatically uses localStorage-only mode.

## 🔄 Sync Behavior

### Automatic Sync

- **Background Process**: Runs every 30 seconds
- **Retry Logic**: Up to 3 retries with exponential backoff
- **Queue Management**: Failed operations are queued for later sync

### Manual Sync

```typescript
// Check sync status
const hybridRepo = repository as any; // If using hybrid repository
const status = await hybridRepo.getSyncStatus();
console.log(`${status.pending} operations pending sync`);

// Manually trigger sync
await hybridRepo.syncNow();
```

## 📊 Performance Characteristics

- **LocalStorage Operations**: < 50ms
- **Appwrite Operations**: < 500ms (with timeout)
- **Automatic Caching**: Frequently accessed data
- **Memory Efficient**: Cleanup of old cached data

## 🎯 Repository Interfaces

All repositories implement clean domain interfaces:

```typescript
interface ITypingRepository {
  save(test: TypingTest): Promise<void>;
  getUserTests(userId: string, filters?: TestFilters): Promise<TypingTest[]>;
  getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]>;
  // ... more methods
}
```

## 🛡️ Type Safety

- **Strong Typing**: All operations are fully typed
- **Domain Entities**: Uses clean domain entities
- **Error Types**: Custom error hierarchy for better handling

## 🔍 Monitoring & Debugging

### Logging

All repositories include comprehensive logging:

```typescript
// Enable debug logging in development
const logger = container.resolve<ILogger>("Logger");
logger.info("Repository operation completed");
```

### Health Checks

```typescript
const client = container.resolve<AppwriteDatabaseClient>("AppwriteClient");
const isHealthy = await client.isHealthy();
```

## 🧪 Testing Strategy

The repository pattern enables easy testing:

```typescript
// Mock repositories for unit tests
const mockRepository: ITypingRepository = {
  save: jest.fn(),
  getUserTests: jest.fn(),
  // ... other methods
};

container.register("TypingRepository", mockRepository);
```

## 🔒 Security Considerations

- **Data Validation**: All inputs validated before storage
- **User Isolation**: Data access restricted by user permissions
- **Error Sanitization**: Sensitive information not exposed in errors

## 📈 Scalability Features

- **Batch Operations**: Efficient bulk data operations
- **Lazy Loading**: Data loaded on demand
- **Memory Management**: Automatic cleanup of cached data
- **Connection Pooling**: Efficient database connections

## 🔗 Integration Points

### With Existing Code

The infrastructure layer integrates seamlessly:

1. **Replace Direct Database Calls**: Use repositories instead
2. **Update Service Layer**: Inject repositories via DI container
3. **Maintain Backward Compatibility**: Existing interfaces preserved

### With Application Layer

Ready for Phase 3 (Application Layer):

```typescript
// Use cases can resolve repositories
const typingRepository = container.resolve<ITypingRepository>("TypingRepository");
```

## 📚 Additional Resources

- **Domain Interfaces**: `/src/domain/interfaces/`
- **Error Types**: `/src/shared/errors/`
- **Usage Examples**: `/src/infrastructure/examples/`
- **Planning Document**: `/docs/plan-refactor.md`

## 🎉 What's Next

This infrastructure layer enables:

- **Phase 3**: Application Layer (Use Cases)
- **Enhanced Features**: Real-time sync, conflict resolution
- **Performance Optimization**: Caching strategies, indexing
- **Advanced Patterns**: CQRS, Event Sourcing
