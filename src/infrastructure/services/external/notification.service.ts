import {
  INotificationService,
  NotificationConfig,
  NotificationType
} from "@/domain/interfaces";

/**
 * Browser-based notification service using toast notifications
 */
export class NotificationService implements INotificationService {
  private notifications: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;
  private notificationIdCounter = 0;

  constructor() {
    this.initializeContainer();
  }

  private initializeContainer(): void {
    // Create notification container if it doesn't exist
    this.container = document.getElementById('notification-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  async show(config: NotificationConfig): Promise<void> {
    if (!this.container) {
      this.initializeContainer();
    }

    const notificationId = `notification-${++this.notificationIdCounter}`;
    const element = this.createNotificationElement(config, notificationId);
    
    this.notifications.set(notificationId, element);
    this.container!.appendChild(element);

    // Animate in
    setTimeout(() => {
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
    }, 10);

    // Auto-dismiss if duration is set
    if (config.duration && config.duration > 0) {
      setTimeout(() => {
        this.dismissNotification(notificationId);
      }, config.duration);
    }
  }

  async success(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      type: NotificationType.SUCCESS,
      title: title || 'Success',
      duration: 4000
    });
  }

  async error(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      type: NotificationType.ERROR,
      title: title || 'Error',
      duration: 6000 // Longer for errors
    });
  }

  async warning(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      type: NotificationType.WARNING,
      title: title || 'Warning',
      duration: 5000
    });
  }

  async info(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      type: NotificationType.INFO,
      title: title || 'Info',
      duration: 4000
    });
  }

  async clear(): Promise<void> {
    for (const [id] of this.notifications) {
      this.dismissNotification(id);
    }
  }

  private createNotificationElement(config: NotificationConfig, id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    element.style.cssText = `
      background: ${this.getBackgroundColor(config.type)};
      border: 1px solid ${this.getBorderColor(config.type)};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      color: ${this.getTextColor(config.type)};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      max-width: 100%;
      word-wrap: break-word;
    `;

    // Create content
    const content = document.createElement('div');
    
    if (config.title) {
      const titleElement = document.createElement('div');
      titleElement.textContent = config.title;
      titleElement.style.cssText = `
        font-weight: 600;
        margin-bottom: 4px;
        color: ${this.getTitleColor(config.type)};
      `;
      content.appendChild(titleElement);
    }

    const messageElement = document.createElement('div');
    messageElement.textContent = config.message;
    content.appendChild(messageElement);

    element.appendChild(content);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: ${this.getTextColor(config.type)};
      opacity: 0.6;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    closeButton.addEventListener('click', () => {
      this.dismissNotification(id);
    });

    element.appendChild(closeButton);

    // Add action button if provided
    if (config.actionText && config.onAction) {
      const actionButton = document.createElement('button');
      actionButton.textContent = config.actionText;
      actionButton.style.cssText = `
        background: ${this.getActionButtonColor(config.type)};
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        margin-top: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: white;
      `;
      
      actionButton.addEventListener('click', () => {
        config.onAction!();
        this.dismissNotification(id);
      });

      content.appendChild(actionButton);
    }

    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = this.getIcon(config.type);
    icon.style.cssText = `
      position: absolute;
      left: 12px;
      top: 16px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    element.appendChild(icon);
    content.style.marginLeft = '28px';

    return element;
  }

  private dismissNotification(id: string): void {
    const element = this.notifications.get(id);
    if (!element) return;

    // Animate out
    element.style.transform = 'translateX(100%)';
    element.style.opacity = '0';

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.notifications.delete(id);
    }, 300);
  }

  private getBackgroundColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return '#f0f9ff';
      case NotificationType.ERROR: return '#fef2f2';
      case NotificationType.WARNING: return '#fffbeb';
      case NotificationType.INFO: return '#f8fafc';
      default: return '#ffffff';
    }
  }

  private getBorderColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return '#10b981';
      case NotificationType.ERROR: return '#ef4444';
      case NotificationType.WARNING: return '#f59e0b';
      case NotificationType.INFO: return '#3b82f6';
      default: return '#e5e7eb';
    }
  }

  private getTextColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return '#065f46';
      case NotificationType.ERROR: return '#991b1b';
      case NotificationType.WARNING: return '#92400e';
      case NotificationType.INFO: return '#1e40af';
      default: return '#374151';
    }
  }

  private getTitleColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return '#047857';
      case NotificationType.ERROR: return '#dc2626';
      case NotificationType.WARNING: return '#d97706';
      case NotificationType.INFO: return '#2563eb';
      default: return '#111827';
    }
  }

  private getActionButtonColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS: return '#10b981';
      case NotificationType.ERROR: return '#ef4444';
      case NotificationType.WARNING: return '#f59e0b';
      case NotificationType.INFO: return '#3b82f6';
      default: return '#6b7280';
    }
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.793l6.646-6.647a.5.5 0 0 1 .708 0z" fill="#10b981"/>
        </svg>`;
      case NotificationType.ERROR:
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zM5.5 5.5a.5.5 0 1 1 .708.708L8 8.293l1.792-1.585a.5.5 0 1 1 .708.708L8.707 9l1.793 1.585a.5.5 0 1 1-.708.708L8 9.707 6.208 11.293a.5.5 0 1 1-.708-.708L7.293 9 5.5 7.415a.5.5 0 0 1 0-.708z" fill="#ef4444"/>
        </svg>`;
      case NotificationType.WARNING:
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.146 13.282c-.457.778.091 1.718.982 1.718h13.744c.89 0 1.439-.94.982-1.718L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#f59e0b"/>
        </svg>`;
      case NotificationType.INFO:
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm.5 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM7.5 6h1v4.5h-1V6z" fill="#3b82f6"/>
        </svg>`;
      default:
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#6b7280" fill="none"/>
          <path d="M8 4v4m0 4h.01" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
    }
  }
}