import { trackEvent } from '../../services/analyticsService';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogEntries = 1000; // Keep last 1000 entries in memory
  private currentLogLevel: LogLevel = LogLevel.INFO;
  private sessionId: string;
  private isProduction: boolean;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.isProduction = import.meta.env.PROD;
    
    // Set log level based on environment
    if (this.isProduction) {
      this.currentLogLevel = LogLevel.WARN;
    } else {
      this.currentLogLevel = LogLevel.DEBUG;
    }

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', 'global', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', 'global', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      userId: this.getUserId(),
      sessionId: this.sessionId,
    };
  }

  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private addLogEntry(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogEntries
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Console output in development
    if (!this.isProduction) {
      const levelName = LogLevel[entry.level];
      const contextStr = entry.context ? `[${entry.context}]` : '';
      const dataStr = entry.data ? JSON.stringify(entry.data, null, 2) : '';
      
      switch (entry.level) {
        case LogLevel.DEBUG:

          break;
        case LogLevel.INFO:

          break;
        case LogLevel.WARN:
          if (process.env.NODE_ENV !== 'production') {
          console.warn(`${entry.timestamp} WARN ${contextStr} ${entry.message}`, dataStr);
          }
          break;
        case LogLevel.ERROR:
          if (process.env.NODE_ENV !== 'production') {
          console.error(`${entry.timestamp} ERROR ${contextStr} ${entry.message}`, dataStr);
          }
          break;
      }
    }
  }

  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.addLogEntry(this.createLogEntry(LogLevel.DEBUG, message, context, data));
  }

  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.addLogEntry(this.createLogEntry(LogLevel.INFO, message, context, data));
  }

  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.addLogEntry(this.createLogEntry(LogLevel.WARN, message, context, data));
  }

  error(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data);
    this.addLogEntry(entry);

    // Track errors in analytics
    trackEvent('error_logged', {
      message,
      context,
      level: 'error',
      hasData: !!data,
    });
  }

  // Performance logging
  time(label: string, context?: string): void {
    this.debug(`Timer started: ${label}`, context, { timerLabel: label, action: 'start' });
  }

  timeEnd(label: string, context?: string): void {
    this.debug(`Timer ended: ${label}`, context, { timerLabel: label, action: 'end' });
  }

  // API call logging
  logApiCall(method: string, url: string, status: number, duration: number, context?: string): void {
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.INFO;
    this.addLogEntry(this.createLogEntry(level, `API ${method} ${url} - ${status}`, context, {
      method,
      url,
      status,
      duration,
    }));
  }

  // User action logging
  logUserAction(action: string, details?: any, context?: string): void {
    this.info(`User action: ${action}`, context, details);
    
    // Also track in analytics
    trackEvent('user_action_logged', {
      action,
      hasDetails: !!details,
      context,
    });
  }

  // Get logs for debugging or support
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level !== undefined) {
      filteredLogs = this.logs.filter(log => log.level >= level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  // Export logs for support purposes
  exportLogs(): string {
    const logsData = {
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.getLogs(),
    };
    
    return JSON.stringify(logsData, null, 2);
  }

  // Clear logs (useful for privacy)
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', 'logging');
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info(`Log level changed to ${LogLevel[level]}`, 'logging');
  }
}

// Create singleton instance
export const logger = new LoggingService();

// Convenience methods for easier usage
export const log = {
  debug: (message: string, context?: string, data?: any) => logger.debug(message, context, data),
  info: (message: string, context?: string, data?: any) => logger.info(message, context, data),
  warn: (message: string, context?: string, data?: any) => logger.warn(message, context, data),
  error: (message: string, context?: string, data?: any) => logger.error(message, context, data),
  time: (label: string, context?: string) => logger.time(label, context),
  timeEnd: (label: string, context?: string) => logger.timeEnd(label, context),
  apiCall: (method: string, url: string, status: number, duration: number, context?: string) => 
    logger.logApiCall(method, url, status, duration, context),
  userAction: (action: string, details?: any, context?: string) => 
    logger.logUserAction(action, details, context),
};