## 🎯 Goal

Implement data access layer with repository pattern supporting Appwrite cloud database, localStorage fallback, and hybrid offline/online operation. This provides reliable data persistence with graceful degradation.

## 📋 Tasks

### Appwrite Repositories (`src/infrastructure/repositories/appwrite/`)

- [ ] Create `appwrite-typing.repository.ts` - Typing test persistence with Appwrite
- [ ] Create `appwrite-user.repository.ts` - User data and preferences
- [ ] Create `appwrite-competition.repository.ts` - Competition data management
- [ ] Create `appwrite-keyboard-layout.repository.ts` - Custom keyboard layouts
- [ ] Add error handling, retry logic, and connection management

### LocalStorage Repositories (`src/infrastructure/repositories/local-storage/`)

- [ ] Create `local-typing.repository.ts` - Offline typing test storage
- [ ] Create `local-user-preferences.repository.ts` - Local user settings
- [ ] Create `local-keyboard-layout.repository.ts` - Local custom layouts
- [ ] Implement data serialization, versioning, and migration

### Hybrid Repository (`src/infrastructure/repositories/hybrid/`)

- [ ] Create `hybrid-typing.repository.ts` - Dual write: Appwrite + LocalStorage
- [ ] Implement automatic sync when online
- [ ] Add conflict resolution for offline changes
- [ ] Queue failed operations for retry
- [ ] Smart caching and data freshness management

### Database Client & Configuration (`src/infrastructure/persistence/`)

- [ ] Create `appwrite/database-client.ts` - Appwrite SDK wrapper
- [ ] Create `appwrite/collections.config.ts` - Collection schemas
- [ ] Create `local-storage/storage-client.ts` - LocalStorage abstraction
- [ ] Add connection pooling and performance optimization

## 🏗️ Architecture Patterns

- **Repository Pattern** - Clean interface for data access
- **Adapter Pattern** - Multiple storage backends with same interface
- **Hybrid Pattern** - Seamless online/offline operation
- **Circuit Breaker** - Fail fast when Appwrite unavailable

## 📁 Expected Folder Structure

```
src/infrastructure/repositories/
├── appwrite/
│   ├── appwrite-typing.repository.ts
│   ├── appwrite-user.repository.ts
│   ├── appwrite-competition.repository.ts
│   └── appwrite-keyboard-layout.repository.ts
├── local-storage/
│   ├── local-typing.repository.ts
│   ├── local-user-preferences.repository.ts
│   └── local-keyboard-layout.repository.ts
└── hybrid/
    └── hybrid-typing.repository.ts

src/infrastructure/persistence/
├── appwrite/
│   ├── database-client.ts
│   └── collections.config.ts
└── local-storage/
    └── storage-client.ts
```

## 🔧 Technical Requirements

### Appwrite Integration

- Use Appwrite MCP server tools for accurate API interactions
- Handle authentication states and permissions
- Implement proper error mapping from Appwrite to domain errors
- Support real-time subscriptions for leaderboards

### Keyboard Layout Repository Priority

```typescript
interface IKeyboardLayoutRepository {
  getAvailableLayouts(language: LanguageCode): Promise<KeyboardLayout[]>;
  getLayoutById(layoutId: string): Promise<KeyboardLayout | null>;
  saveCustomLayout(layout: KeyboardLayout): Promise<void>;
  getUserPreferredLayout(
    userId: string,
    language: LanguageCode
  ): Promise<string | null>;
  setUserPreferredLayout(
    userId: string,
    language: LanguageCode,
    layoutId: string
  ): Promise<void>;
}
```

### Offline Support Strategy

- **Practice Mode**: Full offline functionality
- **Normal Mode**: Queue for sync when online
- **Competition Mode**: Require online connectivity
- Data versioning and conflict resolution

### Performance Requirements

- LocalStorage operations < 50ms
- Appwrite operations < 500ms (with timeout)
- Automatic caching of frequently accessed data
- Batch operations for efficiency

## ✅ Acceptance Criteria

- [ ] All repositories implement domain interfaces correctly
- [ ] Hybrid repository handles online/offline scenarios seamlessly
- [ ] Proper error handling and user feedback
- [ ] Data consistency between Appwrite and localStorage
- [ ] Background sync works reliably
- [ ] Performance meets requirements
- [ ] Memory usage is optimized
- [ ] Graceful degradation when Appwrite unavailable

## 🧪 Testing Strategy

- [ ] Unit tests for each repository implementation
- [ ] Integration tests with real Appwrite instance
- [ ] Offline scenario testing
- [ ] Data synchronization testing
- [ ] Performance benchmarking
- [ ] Error handling verification

## 🔗 Dependencies

- **Requires**: Phase 1 Domain Layer (repository interfaces)
- **Requires**: Phase 1 DI Container (service registration)
- **Enables**: Phase 3 Application Layer (use cases)

## 🛠️ Implementation Notes

- Use Appwrite MCP server tools for database operations
- Implement exponential backoff for retry logic
- Add proper TypeScript types for all data operations
- Consider data migration strategies for schema changes

## 📚 Reference

See `/docs/plan-refactor.md` sections on repository implementation and hybrid patterns.
