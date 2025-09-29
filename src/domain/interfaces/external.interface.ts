/**
 * Notification types
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  /** Notification message */
  message: string;
  /** Notification type */
  type: NotificationType;
  /** Duration to show (ms), 0 for persistent */
  duration?: number;
  /** Custom title */
  title?: string;
  /** Action button text */
  actionText?: string;
  /** Action callback */
  onAction?: () => void;
}

/**
 * Appwrite client health status
 */
export interface AppwriteHealthStatus {
  /** Is client connected */
  isConnected: boolean;
  /** Connection status */
  status: 'online' | 'offline' | 'error';
  /** Last successful ping */
  lastPing?: number;
  /** Error message if any */
  errorMessage?: string;
}

/**
 * Notification service interface
 */
export interface INotificationService {
  /**
   * Show a notification
   */
  show(config: NotificationConfig): Promise<void>;

  /**
   * Show success notification
   */
  success(message: string, title?: string): Promise<void>;

  /**
   * Show error notification
   */
  error(message: string, title?: string): Promise<void>;

  /**
   * Show warning notification
   */
  warning(message: string, title?: string): Promise<void>;

  /**
   * Show info notification
   */
  info(message: string, title?: string): Promise<void>;

  /**
   * Clear all notifications
   */
  clear(): Promise<void>;
}

/**
 * Appwrite client service interface
 */
export interface IAppwriteClientService {
  /**
   * Check if Appwrite is properly configured
   */
  isConfigured(): boolean;

  /**
   * Check connection health
   */
  checkHealth(): Promise<AppwriteHealthStatus>;

  /**
   * Get current user session
   */
  getCurrentSession(): Promise<unknown>;

  /**
   * Handle authentication errors
   */
  handleAuthError(error: unknown): Promise<void>;

  /**
   * Retry failed operations
   */
  retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries?: number
  ): Promise<T>;

  /**
   * Get database client
   */
  getDatabaseClient(): unknown;

  /**
   * Get account client
   */
  getAccountClient(): unknown;
}