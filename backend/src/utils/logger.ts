import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define which transports the logger must use
const transports = [
  // Allow to see logs in console
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // Allow to print all the messages inside the all.log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Define logger configuration
const Logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

// Create the log directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
const logDir = 'logs';
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Enhanced logger with additional methods for SwellScope specific logging
export const logger = {
  error: (message: string, error?: any) => {
    if (error) {
      Logger.error(`${message} - ${error.message || error}`, { 
        stack: error.stack,
        timestamp: new Date().toISOString(),
        service: 'SwellScope'
      });
    } else {
      Logger.error(message);
    }
  },
  
  warn: (message: string, meta?: any) => {
    Logger.warn(message, { 
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },
  
  info: (message: string, meta?: any) => {
    Logger.info(message, { 
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },
  
  http: (message: string, meta?: any) => {
    Logger.http(message, { 
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },
  
  debug: (message: string, meta?: any) => {
    Logger.debug(message, { 
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },

  // SwellScope specific logging methods
  risk: (message: string, data?: any) => {
    Logger.info(`[RISK] ${message}`, {
      category: 'risk',
      data,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },

  analytics: (message: string, data?: any) => {
    Logger.info(`[ANALYTICS] ${message}`, {
      category: 'analytics',
      data,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },

  bridge: (message: string, data?: any) => {
    Logger.info(`[BRIDGE] ${message}`, {
      category: 'bridge',
      data,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },

  avs: (message: string, data?: any) => {
    Logger.info(`[AVS] ${message}`, {
      category: 'avs',
      data,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },

  performance: (message: string, timing?: number, meta?: any) => {
    Logger.info(`[PERFORMANCE] ${message}`, {
      category: 'performance',
      timing,
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  },

  security: (message: string, data?: any) => {
    Logger.warn(`[SECURITY] ${message}`, {
      category: 'security',
      data,
      timestamp: new Date().toISOString(),
      service: 'SwellScope'
    });
  }
};

export default logger; 