/**
 * Error logging utility for the application
 * 
 * In development: logs to console
 * In production: can integrate with error tracking services (Sentry, LogRocket, etc.)
 * 
 * NEVER logs sensitive user data (tokens, passwords, personal info)
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  conversationId?: string;
  [key: string]: unknown;
}

class ErrorLogger {
  private isDev = import.meta.env.DEV;
  private isProd = import.meta.env.PROD;

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context: ErrorContext): ErrorContext {
    const sanitized = { ...context };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'accessToken',
      'refreshToken',
    ];

    const removeRecursive = (obj: Record<string, unknown>) => {
      for (const key in obj) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeRecursive(obj[key] as Record<string, unknown>);
        }
      }
    };

    removeRecursive(sanitized as Record<string, unknown>);
    return sanitized;
  }

  /**
   * Log error to console in development
   */
  private logToConsole(
    level: 'error' | 'warn' | 'info',
    message: string,
    error?: Error,
    context?: ErrorContext
  ): void {
    if (!this.isDev) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, error, context);
        break;
      case 'warn':
        console.warn(prefix, message, error, context);
        break;
      case 'info':
        console.info(prefix, message, context);
        break;
    }
  }

  /**
   * Send error to tracking service in production (optional)
   */
  private logToService(
    message: string,
    error?: Error,
    context?: ErrorContext
  ): void {
    if (!this.isProd) return;

    // Example: Integrate with Sentry, LogRocket, etc.
    // window.Sentry?.captureException(error, {
    //   tags: { component: context?.component },
    //   extra: context,
    // });

    // For now, just log a minimal message (no implementation)
    // This can be expanded when error tracking service is added
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: ErrorContext): void {
    const sanitized = context ? this.sanitizeContext(context) : undefined;
    this.logToConsole('error', message, error, sanitized);
    this.logToService(message, error, sanitized);
  }

  /**
   * Log a warning
   */
  warn(message: string, error?: Error, context?: ErrorContext): void {
    const sanitized = context ? this.sanitizeContext(context) : undefined;
    this.logToConsole('warn', message, error, sanitized);
  }

  /**
   * Log info (development only)
   */
  info(message: string, context?: ErrorContext): void {
    const sanitized = context ? this.sanitizeContext(context) : undefined;
    this.logToConsole('info', message, undefined, sanitized);
  }

  /**
   * Log network error with additional details
   */
  network(error: Error, context?: ErrorContext): void {
    this.error('Network error occurred', error, {
      ...context,
      isOnline: window.navigator.onLine,
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Log API error with status code
   */
  api(
    message: string,
    statusCode: number,
    error?: Error,
    context?: ErrorContext
  ): void {
    this.error(`API error: ${message}`, error, {
      ...context,
      statusCode,
    });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = errorLogger.error.bind(errorLogger);
export const logWarn = errorLogger.warn.bind(errorLogger);
export const logInfo = errorLogger.info.bind(errorLogger);
export const logNetworkError = errorLogger.network.bind(errorLogger);
export const logApiError = errorLogger.api.bind(errorLogger);
