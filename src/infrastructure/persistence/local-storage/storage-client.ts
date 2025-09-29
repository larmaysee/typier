import { RepositoryError } from "@/shared/errors";
import type { ILogger } from "@/shared/utils/logger";

export interface StorageItem<T> {
  data: T;
  version: string;
  timestamp: number;
}

export interface StorageConfig {
  version: string;
  keyPrefix: string;
}

export class LocalStorageClient {
  private config: StorageConfig;
  private isAvailable: boolean;

  constructor(
    config: StorageConfig,
    private logger: ILogger
  ) {
    this.config = config;
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      this.logger.warn('localStorage is not available');
      return false;
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}_${key}`;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (!this.isAvailable) {
      throw new RepositoryError('localStorage is not available');
    }

    try {
      const storageItem: StorageItem<T> = {
        data: value,
        version: this.config.version,
        timestamp: Date.now()
      };

      const serialized = JSON.stringify(storageItem);
      localStorage.setItem(this.getKey(key), serialized);
      
      this.logger.debug(`Saved item to localStorage: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to save item to localStorage: ${key}`, error as Error);
      throw new RepositoryError(`Failed to save item: ${key}`, error as Error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const serialized = localStorage.getItem(this.getKey(key));
      if (!serialized) {
        return null;
      }

      const storageItem: StorageItem<T> = JSON.parse(serialized);
      
      // Version check - if version doesn't match, return null (will trigger migration)
      if (storageItem.version !== this.config.version) {
        this.logger.warn(`Version mismatch for key ${key}: expected ${this.config.version}, got ${storageItem.version}`);
        return null;
      }

      return storageItem.data;
    } catch (error) {
      this.logger.error(`Failed to get item from localStorage: ${key}`, error as Error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.removeItem(this.getKey(key));
      this.logger.debug(`Removed item from localStorage: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to remove item from localStorage: ${key}`, error as Error);
      throw new RepositoryError(`Failed to remove item: ${key}`, error as Error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const keys: string[] = [];
      const prefix = `${this.config.keyPrefix}_`;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key.substring(prefix.length));
        }
      }
      
      return keys;
    } catch (error) {
      this.logger.error('Failed to get all keys from localStorage', error as Error);
      return [];
    }
  }

  async clear(): Promise<void> {
    if (!this.isAvailable) {
      return;
    }

    try {
      const keys = await this.getAllKeys();
      for (const key of keys) {
        await this.removeItem(key);
      }
      this.logger.info('Cleared all items from localStorage');
    } catch (error) {
      this.logger.error('Failed to clear localStorage', error as Error);
      throw new RepositoryError('Failed to clear localStorage', error as Error);
    }
  }

  async getStorageSize(): Promise<number> {
    if (!this.isAvailable) {
      return 0;
    }

    try {
      let totalSize = 0;
      const prefix = `${this.config.keyPrefix}_`;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      this.logger.error('Failed to calculate storage size', error as Error);
      return 0;
    }
  }

  isHealthy(): boolean {
    return this.isAvailable;
  }
}