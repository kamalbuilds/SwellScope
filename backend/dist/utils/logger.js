"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const tslib_1 = require("tslib");
const winston_1 = tslib_1.__importDefault(require("winston"));
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
winston_1.default.addColors(colors);
// Define format for console output
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define format for file output
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Define which transports the logger must use
const transports = [
    // Allow to see logs in console
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
    // Allow to print all the error level messages inside the error.log file
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // Allow to print all the messages inside the all.log file
    new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];
// Define logger configuration
const Logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    transports,
    // Do not exit on handled exceptions
    exitOnError: false,
});
// Create the log directory if it doesn't exist
const fs_1 = require("fs");
const logDir = 'logs';
if (!(0, fs_1.existsSync)(logDir)) {
    (0, fs_1.mkdirSync)(logDir);
}
// Enhanced logger with additional methods for SwellScope specific logging
exports.logger = {
    error: (message, error) => {
        if (error) {
            Logger.error(`${message} - ${error.message || error}`, {
                stack: error.stack,
                timestamp: new Date().toISOString(),
                service: 'SwellScope'
            });
        }
        else {
            Logger.error(message);
        }
    },
    warn: (message, meta) => {
        Logger.warn(message, {
            ...meta,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    info: (message, meta) => {
        Logger.info(message, {
            ...meta,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    http: (message, meta) => {
        Logger.http(message, {
            ...meta,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    debug: (message, meta) => {
        Logger.debug(message, {
            ...meta,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    // SwellScope specific logging methods
    risk: (message, data) => {
        Logger.info(`[RISK] ${message}`, {
            category: 'risk',
            data,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    analytics: (message, data) => {
        Logger.info(`[ANALYTICS] ${message}`, {
            category: 'analytics',
            data,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    bridge: (message, data) => {
        Logger.info(`[BRIDGE] ${message}`, {
            category: 'bridge',
            data,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    avs: (message, data) => {
        Logger.info(`[AVS] ${message}`, {
            category: 'avs',
            data,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    performance: (message, timing, meta) => {
        Logger.info(`[PERFORMANCE] ${message}`, {
            category: 'performance',
            timing,
            ...meta,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    },
    security: (message, data) => {
        Logger.warn(`[SECURITY] ${message}`, {
            category: 'security',
            data,
            timestamp: new Date().toISOString(),
            service: 'SwellScope'
        });
    }
};
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map