import { ILogger } from "./logger";

export class ConsoleLogger implements ILogger {
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, error?: Error, ...args: any[]): void {
    if (error) {
      console.warn(`[WARN] ${message}`, error, ...args);
    } else {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (error) {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}