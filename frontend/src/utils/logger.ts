export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    const message = entry.message;
    
    let logString = `${timestamp} ${level} ${context} ${message}`;
    
    if (entry.data && !this.isProduction) {
      logString += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error && !this.isProduction) {
      logString += `\nError: ${entry.error.stack || entry.error.message}`;
    }
    
    return logString;
  }

  private log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
    }

    // In production, you might want to send logs to a service like Sentry, LogRocket, etc.
    if (this.isProduction && level === LogLevel.ERROR) {
      this.sendToExternalService();
    }
  }

  private sendToExternalService() {
    // TODO: Implement external logging service integration
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    // For now, we'll just log that we would send to external service
    if (process.env.NODE_ENV === 'development') {
      // Development mode - no external logging needed
    }
  }

  error(message: string, context?: string, data?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context, data);
  }
}

export const logger = new Logger();

// Convenience functions for common logging patterns
export const logError = (message: string, context?: string, data?: Record<string, unknown>, error?: Error) => 
  logger.error(message, context, data, error);

export const logWarn = (message: string, context?: string, data?: Record<string, unknown>) => 
  logger.warn(message, context, data);

export const logInfo = (message: string, context?: string, data?: Record<string, unknown>) => 
  logger.info(message, context, data);

export const logDebug = (message: string, context?: string, data?: Record<string, unknown>) => 
  logger.debug(message, context, data);
