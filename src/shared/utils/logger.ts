export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, error?: Error, ...args: unknown[]): void;
  error(message: string, error?: Error, ...args: unknown[]): void;
}
