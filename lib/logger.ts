// Logging utility (replaces console.log in production)

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      log += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // In production, you would send this to a logging service (e.g., Sentry, LogRocket)
    // For now, we'll use console in development and silent in production (unless error)
    if (this.isDevelopment || level === 'error') {
      const formattedLog = this.formatLog(entry);

      switch (level) {
        case 'error':
          console.error(formattedLog);
          break;
        case 'warn':
          console.warn(formattedLog);
          break;
        case 'info':
          console.info(formattedLog);
          break;
        case 'debug':
          console.debug(formattedLog);
          break;
      }
    }

    // In production, send to logging service
    if (!this.isDevelopment && level === 'error') {
      // TODO: Integrate with error tracking service (Sentry, etc.)
      // Example: Sentry.captureException(new Error(message), { extra: context });
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
