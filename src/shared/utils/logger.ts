export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, error?: Error, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;
}