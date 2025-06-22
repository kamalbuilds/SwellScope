import { Request, Response, NextFunction } from 'express';

export const validateQueryParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredParams.filter(param => !req.query[param]);
    
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required query parameters',
        missing,
        timestamp: Date.now()
      });
      return;
    }
    
    next();
  };
};

export const validateBody = (requiredFields: string[], optionalFields: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Request body is required',
        timestamp: Date.now()
      });
      return;
    }
    
    const missing = requiredFields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields in request body',
        missing,
        timestamp: Date.now()
      });
      return;
    }
    
    // Optional fields validation can be added here if needed
    // For now, we just accept them without validation
    
    next();
  };
};

export const validateAddress = (addressField: string = 'address') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const address = req.params[addressField] || req.query[addressField] || req.body[addressField];
    
    if (!address) {
      res.status(400).json({
        success: false,
        error: `${addressField} is required`,
        timestamp: Date.now()
      });
      return;
    }
    
    // Basic Ethereum address validation (0x + 40 hex characters)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      res.status(400).json({
        success: false,
        error: `Invalid ${addressField} format`,
        timestamp: Date.now()
      });
      return;
    }
    
    next();
  };
};

export const validatePagination = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { page, limit } = req.query;
    
    if (page && isNaN(Number(page))) {
      res.status(400).json({
        success: false,
        error: 'Page must be a valid number',
        timestamp: Date.now()
      });
      return;
    }
    
    if (limit && isNaN(Number(limit))) {
      res.status(400).json({
        success: false,
        error: 'Limit must be a valid number',
        timestamp: Date.now()
      });
      return;
    }
    
    // Set defaults and bounds
    req.query.page = String(Math.max(1, Number(page) || 1));
    req.query.limit = String(Math.min(100, Math.max(1, Number(limit) || 20)));
    
    next();
  };
};

export const validateTimeRange = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { from, to } = req.query;
    
    if (from && isNaN(Number(from))) {
      res.status(400).json({
        success: false,
        error: 'From timestamp must be a valid number',
        timestamp: Date.now()
      });
      return;
    }
    
    if (to && isNaN(Number(to))) {
      res.status(400).json({
        success: false,
        error: 'To timestamp must be a valid number',
        timestamp: Date.now()
      });
      return;
    }
    
    if (from && to && Number(from) > Number(to)) {
      res.status(400).json({
        success: false,
        error: 'From timestamp cannot be greater than to timestamp',
        timestamp: Date.now()
      });
      return;
    }
    
    next();
  };
};

export const validateNumericParam = (paramName: string, min?: number, max?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName] || req.query[paramName] || req.body[paramName];
    
    if (value === undefined || value === null) {
      res.status(400).json({
        success: false,
        error: `${paramName} is required`,
        timestamp: Date.now()
      });
      return;
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) {
      res.status(400).json({
        success: false,
        error: `${paramName} must be a valid number`,
        timestamp: Date.now()
      });
      return;
    }
    
    if (min !== undefined && numValue < min) {
      res.status(400).json({
        success: false,
        error: `${paramName} must be at least ${min}`,
        timestamp: Date.now()
      });
      return;
    }
    
    if (max !== undefined && numValue > max) {
      res.status(400).json({
        success: false,
        error: `${paramName} must not exceed ${max}`,
        timestamp: Date.now()
      });
      return;
    }
    
    next();
  };
};

export const validateQuery = (allowedParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.filter(key => !allowedParams.includes(key));
    
    if (invalidParams.length > 0) {
      res.status(400).json({
        success: false,
        error: `Invalid query parameters: ${invalidParams.join(', ')}`,
        message: `Allowed parameters: ${allowedParams.join(', ')}`,
        timestamp: Date.now()
      });
      return;
    }
    
    next();
  };
}; 