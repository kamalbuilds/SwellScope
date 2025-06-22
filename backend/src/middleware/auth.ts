import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, AuthenticatedRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export interface JWTPayload {
  userId: string;
  address: string;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware that validates JWT tokens
 * Supports optional authentication - if no token provided, continues without user info
 */
export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // No token provided - continue without authentication
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    
    next();
  } catch (error) {
    // Invalid token - return error
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Please provide a valid authentication token',
      timestamp: Date.now()
    });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      req.user = {
        id: decoded.userId,
        address: decoded.address,
      } as User;
      
      req.token = token;
    } catch (jwtError) {
      // Invalid token, but continue without user (optional auth)
      console.warn('Invalid token in optional auth:', jwtError);
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

export const generateToken = (userId: string, address: string): string => {
  return jwt.sign(
    {
      userId,
      address,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}; 