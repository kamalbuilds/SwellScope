"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVSError = exports.BridgeError = exports.SlashingRiskError = exports.RiskAssessmentError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
// Error handling for different types of errors
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log the error with context
    logger_1.logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query,
        timestamp: new Date().toISOString()
    });
    let statusCode = 500;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_ERROR';
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        code = 'VALIDATION_ERROR';
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
        code = 'CAST_ERROR';
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
        code = 'INVALID_TOKEN';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';
        code = 'TOKEN_EXPIRED';
    }
    else if (err.code === '11000') {
        statusCode = 400;
        message = 'Duplicate field value';
        code = 'DUPLICATE_ERROR';
    }
    else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code || 'CUSTOM_ERROR';
    }
    // Create standardized error response
    const errorResponse = {
        code,
        message,
        timestamp: Date.now(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    // Additional details for development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = {
            originalMessage: err.message,
            path: req.path,
            method: req.method,
        };
    }
    res.status(statusCode).json({
        success: false,
        error: errorResponse
    });
};
exports.errorHandler = errorHandler;
// 404 handler
const notFoundHandler = (req, res) => {
    const message = `Route ${req.originalUrl} not found`;
    logger_1.logger.warn('Route not found:', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message,
            timestamp: Date.now()
        }
    });
};
exports.notFoundHandler = notFoundHandler;
// Async error wrapper to catch async errors in route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Custom error classes for different scenarios
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429);
    }
}
exports.RateLimitError = RateLimitError;
// Risk-specific errors for SwellScope
class RiskAssessmentError extends AppError {
    constructor(message = 'Risk assessment failed') {
        super(message, 422);
    }
}
exports.RiskAssessmentError = RiskAssessmentError;
class SlashingRiskError extends AppError {
    constructor(message = 'High slashing risk detected') {
        super(message, 422);
    }
}
exports.SlashingRiskError = SlashingRiskError;
class BridgeError extends AppError {
    constructor(message = 'Bridge operation failed') {
        super(message, 422);
    }
}
exports.BridgeError = BridgeError;
class AVSError extends AppError {
    constructor(message = 'AVS operation failed') {
        super(message, 422);
    }
}
exports.AVSError = AVSError;
//# sourceMappingURL=errorHandler.js.map