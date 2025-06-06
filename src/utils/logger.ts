import { config } from '../config/app.config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = config.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const logMessage = this.formatMessage(level, message, meta);
    
    if (this.isDevelopment) {
      console.log(JSON.stringify(logMessage, null, 2));
    } else {
      // In production, you might want to send logs to a service like CloudWatch, etc.
      console.log(JSON.stringify(logMessage));
    }
  }

  public debug(message: string, meta?: any) {
    if (this.isDevelopment) {
      this.log('debug', message, meta);
    }
  }

  public info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: any) {
    this.log('error', message, meta);
  }
}

export const logger = Logger.getInstance(); 