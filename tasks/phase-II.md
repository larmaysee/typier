## 🎯 Goal

Set up the dependency injection container system to enable proper inversion of control throughout the application. This foundation is critical for testability and maintainability.

## 📋 Tasks

### DI Container Setup (`src/infrastructure/di/`)

- [ ] Create `container.ts` - Main dependency injection container implementation
- [ ] Create `bindings.ts` - Service binding configurations for all layers
- [ ] Create `providers.ts` - Provider registration and factory methods

### Service Registration

- [ ] Register repository implementations (Appwrite, LocalStorage, Hybrid)
- [ ] Register application use cases
- [ ] Register infrastructure services (text generation, analytics, etc.)
- [ ] Register keyboard layout services and providers
- [ ] Configure service lifetimes (singleton, transient, scoped)

### Provider Composition Root

- [ ] Create composition root for dependency resolution
- [ ] Set up service locator pattern
- [ ] Configure environment-specific bindings
- [ ] Add service health checking capabilities

### Integration Hooks

- [ ] Create React hook `useDependencyInjection()` for component access
- [ ] Create provider wrapper `DependencyInjectionProvider`
- [ ] Add container context for React components
- [ ] Implement proper cleanup and disposal

## 🏗️ Architecture Principles

- **Dependency Inversion** - High-level modules don't depend on low-level modules
- **Single Responsibility** - Each service has one clear purpose
- **Interface Segregation** - Services depend only on interfaces they use
- **Loose Coupling** - Services are decoupled through interfaces

## 📁 Expected Folder Structure

```
src/infrastructure/di/
├── container.ts           # Main DI container
├── bindings.ts           # Service bindings
└── providers.ts          # Provider registrations

src/presentation/hooks/core/
└── use-dependency-injection.ts

src/presentation/providers/
├── dependency-injection.provider.tsx
└── app-providers.tsx     # Composition root
```

## 🔧 Technical Requirements

### Container Interface

```typescript
interface IDependencyContainer {
  register<T>(token: string, implementation: T | (() => T)): void;
  resolve<T>(token: string): T;
  registerSingleton<T>(token: string, implementation: () => T): void;
  registerTransient<T>(token: string, implementation: () => T): void;
}
```

### Service Tokens

- Use string tokens for service resolution
- Follow consistent naming convention: `ServiceNameUseCase`, `ServiceNameRepository`
- Group related services with prefixes

### Keyboard Layout Services Priority

- `ILayoutManagerService` - Central layout management
- `IKeyboardLayoutRepository` - Layout persistence
- Layout providers for each language (English, Lisu, Myanmar)
- Layout validation and switching services

## ✅ Acceptance Criteria

- [ ] DI container properly resolves all registered services
- [ ] React hook provides easy access to services in components
- [ ] No circular dependencies in service registration
- [ ] Environment-specific configuration support
- [ ] Proper service lifetime management
- [ ] Memory leak prevention with proper disposal
- [ ] Type-safe service resolution
- [ ] Error handling for missing service registrations

## 🧪 Testing Strategy

- [ ] Unit tests for container registration and resolution
- [ ] Integration tests with mock services
- [ ] React component tests using DI hooks
- [ ] Performance tests for service resolution speed

## 🔗 Dependencies

- **Requires**: Phase 1 Domain Layer (repository interfaces)
- **Enables**: All subsequent phases depend on this DI system

## 📚 Reference

See `/docs/plan-refactor.md` sections on DI container setup and service registration patterns.
