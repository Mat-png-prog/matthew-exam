type LogLevel = 'info' | 'warn' | 'error' | 'dev';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    // Only log dev messages in development environment
    if (level === 'dev' && !this.isDevelopment) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMethod = level === 'dev' ? 'info' : level;
    console[logMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  dev(message: string, ...args: any[]) {
    this.log('dev', message, ...args);
  }
}

export const logger = new Logger();