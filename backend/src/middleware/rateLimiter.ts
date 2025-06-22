import { Request, Response, NextFunction } from 'express';
import { RateLimitData } from '../types';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore: Map<string, RateLimitData> = new Map();

export const rateLimit = (
  identifier: string,
  maxRequests: number,
  windowMs: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientKey = `${identifier}:${req.ip || 'unknown'}`;
    const now = Date.now();
    
    const current = rateLimitStore.get(clientKey);
    
    if (!current) {
      // First request from this client
      rateLimitStore.set(clientKey, {
        key: clientKey,
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (now > current.resetTime) {
      // Window has expired, reset
      rateLimitStore.set(clientKey, {
        key: clientKey,
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (current.count >= maxRequests) {
      // Rate limit exceeded
      const timeUntilReset = Math.ceil((current.resetTime - now) / 1000);
      
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': current.resetTime.toString(),
        'Retry-After': timeUntilReset.toString()
      });
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${timeUntilReset} seconds.`,
        timestamp: Date.now()
      });
    }
    
    // Increment count
    current.count++;
    rateLimitStore.set(clientKey, current);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - current.count).toString(),
      'X-RateLimit-Reset': current.resetTime.toString()
    });
    
    next();
  };
};

// Cleanup expired entries (run periodically)
export const cleanupRateLimit = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

// Export store for testing/monitoring
export { rateLimitStore }; 