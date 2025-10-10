/**
 * Mock implementation of INotificationService for development and testing
 */

import { Notification, ReminderData } from "@/domain/interfaces/services";

export interface INotificationService {
  sendNotification(notification: Notification): Promise<void>;
  scheduleReminder(reminder: ReminderData): Promise<string>;
  getUserNotifications(
    userId: string,
    unreadOnly?: boolean
  ): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  cancelReminder(reminderId: string): Promise<void>;
}

export class MockNotificationService implements INotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private reminders: Map<string, ReminderData> = new Map();
  private nextReminderId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with some mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "notif_1",
        type: "success",
        title: "Achievement Unlocked!",
        message: "You've reached 60 WPM average speed. Keep up the great work!",
        timestamp: Date.now() - 3600000, // 1 hour ago
        read: false,
        actionUrl: "/profile/achievements",
      },
      {
        id: "notif_2",
        type: "info",
        title: "Weekly Challenge Available",
        message: "A new weekly typing challenge is now available. Join now!",
        timestamp: Date.now() - 7200000, // 2 hours ago
        read: true,
        actionUrl: "/competitions",
      },
      {
        id: "notif_3",
        type: "warning",
        title: "Practice Reminder",
        message:
          "You haven't practiced today. Even 10 minutes can help maintain your skills!",
        timestamp: Date.now() - 86400000, // 1 day ago
        read: false,
      },
    ];

    this.notifications.set("user1", mockNotifications);
  }

  async sendNotification(notification: Notification): Promise<void> {
    const userId = this.extractUserIdFromNotification(notification);

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const userNotifications = this.notifications.get(userId)!;
    userNotifications.unshift(notification); // Add to beginning

    // Keep only last 50 notifications to prevent memory bloat
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    // In a real implementation, this would send push notifications, emails, etc.
    console.log(`[Notification] Sent to user ${userId}:`, notification);
  }

  async scheduleReminder(reminder: ReminderData): Promise<string> {
    const reminderId = `reminder_${this.nextReminderId++}`;
    this.reminders.set(reminderId, reminder);

    // In a real implementation, this would schedule actual reminders
    console.log(
      `[Reminder] Scheduled for ${new Date(
        reminder.scheduledFor
      ).toLocaleString()}:`,
      reminder
    );

    // Simulate scheduling delay
    const delay = reminder.scheduledFor - Date.now();
    if (delay > 0 && delay < 86400000) {
      // If within 24 hours
      setTimeout(() => {
        this.triggerReminder(reminderId, reminder);
      }, Math.min(delay, 5000)); // Cap at 5 seconds for demo
    }

    return reminderId;
  }

  async getUserNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) || [];

    if (unreadOnly) {
      return userNotifications.filter((notif) => !notif.read);
    }

    return [...userNotifications]; // Return copy
  }

  async markAsRead(notificationId: string): Promise<void> {
    for (const userNotifications of this.notifications.values()) {
      const notification = userNotifications.find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.read = true;
        break;
      }
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach((notification) => {
        notification.read = true;
      });
    }
  }

  async cancelReminder(reminderId: string): Promise<void> {
    this.reminders.delete(reminderId);
    console.log(`[Reminder] Cancelled reminder: ${reminderId}`);
  }

  // Helper methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractUserIdFromNotification(_notification: Notification): string {
    // In a real implementation, this would extract user ID from notification context
    // For mock, we'll assume it's passed in a custom field or derive from current user
    return "user1"; // Default for mock
  }

  private async triggerReminder(
    reminderId: string,
    reminder: ReminderData
  ): Promise<void> {
    const notification: Notification = {
      id: `notif_reminder_${reminderId}`,
      type: "info",
      title: reminder.title,
      message: reminder.message,
      timestamp: Date.now(),
      read: false,
      actionUrl: reminder.actionUrl,
    };

    await this.sendNotification(notification);
    this.reminders.delete(reminderId);
  }

  // Additional utility methods for specific notification types
  async sendAchievementNotification(
    userId: string,
    achievementName: string,
    description: string
  ): Promise<void> {
    const notification: Notification = {
      id: `achievement_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      type: "success",
      title: "Achievement Unlocked!",
      message: `${achievementName}: ${description}`,
      timestamp: Date.now(),
      read: false,
      actionUrl: "/profile/achievements",
    };

    await this.sendNotification(notification);
  }

  async sendCompetitionNotification(
    userId: string,
    competitionTitle: string,
    message: string
  ): Promise<void> {
    const notification: Notification = {
      id: `competition_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      type: "info",
      title: competitionTitle,
      message: message,
      timestamp: Date.now(),
      read: false,
      actionUrl: "/competitions",
    };

    await this.sendNotification(notification);
  }

  async sendPracticeReminder(
    userId: string,
    lastPracticeTime: number
  ): Promise<void> {
    const daysSinceLastPractice = Math.floor(
      (Date.now() - lastPracticeTime) / 86400000
    );
    let message = "Keep your typing skills sharp with daily practice!";

    if (daysSinceLastPractice > 7) {
      message =
        "It's been a while since your last practice. Let's get back to it!";
    } else if (daysSinceLastPractice > 3) {
      message = "Don't lose your momentum. A quick practice session can help!";
    }

    const notification: Notification = {
      id: `practice_reminder_${Date.now()}`,
      type: "warning",
      title: "Practice Reminder",
      message: message,
      timestamp: Date.now(),
      read: false,
    };

    await this.sendNotification(notification);
  }

  async sendImprovementNotification(
    userId: string,
    metric: string,
    improvement: number
  ): Promise<void> {
    const notification: Notification = {
      id: `improvement_${Date.now()}`,
      type: "success",
      title: "Great Progress!",
      message: `Your ${metric} has improved by ${improvement.toFixed(
        1
      )}%. Keep it up!`,
      timestamp: Date.now(),
      read: false,
      actionUrl: "/profile/statistics",
    };

    await this.sendNotification(notification);
  }

  // Analytics methods
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    recentActivity: number;
  }> {
    const notifications = await this.getUserNotifications(userId);
    const unread = notifications.filter((n) => !n.read);

    const byType = notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentActivity = notifications.filter(
      (n) => n.timestamp > oneWeekAgo
    ).length;

    return {
      total: notifications.length,
      unread: unread.length,
      byType,
      recentActivity,
    };
  }
}
