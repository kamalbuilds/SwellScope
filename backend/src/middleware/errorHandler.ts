import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { SwellScopeError } from '../types';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
}

// Error handling for different types of errors
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error with context
  logger.error('Error occurred:', {
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
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    code = 'CAST_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.code === '11000') {
    statusCode = 400;
    message = 'Duplicate field value';
    code = 'DUPLICATE_ERROR';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'CUSTOM_ERROR';
  }

  // Create standardized error response
  const errorResponse: SwellScopeError = {
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

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const message = `Route ${req.originalUrl} not found`;
  
  logger.warn('Route not found:', {
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

// Async error wrapper to catch async errors in route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes for different scenarios
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

// Risk-specific errors for SwellScope
export class RiskAssessmentError extends AppError {
  constructor(message: string = 'Risk assessment failed') {
    super(message, 422);
  }
}

export class SlashingRiskError extends AppError {
  constructor(message: string = 'High slashing risk detected') {
    super(message, 422);
  }
}

export class BridgeError extends AppError {
  constructor(message: string = 'Bridge operation failed') {
    super(message, 422);
  }
}

export class AVSError extends AppError {
  constructor(message: string = 'AVS operation failed') {
    super(message, 422);
  }
} 