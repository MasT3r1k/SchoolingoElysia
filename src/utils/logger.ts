import { Elysia } from 'elysia';
import * as fs from 'fs';
import path from 'path';
import { config } from '../config/app.config';

// Vytvoření složky pro logy, pokud neexistuje
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Cesta k log souboru
const LOG_FILE = path.join(LOG_DIR, 'app.log');

// Funkce pro zápis do souboru
const writeToFile = (message: string) => {
  fs.appendFileSync(LOG_FILE, message + '\n');
};

// Singleton instance loggeru
class Logger {
  private static instance: Logger;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = config.NODE_ENV === 'production';
    // Přidání oddělovače při startu aplikace
    const timestamp = new Date().toISOString();
    const separator = `\n[${timestamp}] ----- NEW START --------\n`;
    writeToFile(separator);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    // V production režimu logujeme pouze do souboru
    if (this.isProduction) {
      writeToFile(logMessage);
    } else {
      // V development režimu logujeme do konzole i do souboru
      console.log(logMessage);
      writeToFile(logMessage);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Elysia middleware pro request logging
export const requestLogger = new Elysia()
  .derive(({ request }) => {
    const start = Date.now();
    const { method, url } = request;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    return {
      logRequest: (message: string) => {
        const duration = Date.now() - start;
        const logMessage = `${method} ${url} - ${duration}ms - ${userAgent} - ${ip} - ${message}`;
        logger.log(logMessage);
      }
    };
  }); 