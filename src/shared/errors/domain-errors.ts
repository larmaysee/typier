export abstract class DomainError extends Error {
  abstract readonly code: string;
  
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RepositoryError extends DomainError {
  readonly code = 'REPOSITORY_ERROR';
}

export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR';
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND_ERROR';
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT_ERROR';
}

export class AuthenticationError extends DomainError {
  readonly code = 'AUTHENTICATION_ERROR';
}

export class AuthorizationError extends DomainError {
  readonly code = 'AUTHORIZATION_ERROR';
}