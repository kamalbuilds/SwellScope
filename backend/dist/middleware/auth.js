"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.optionalAuth = exports.auth = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
/**
 * Authentication middleware that validates JWT tokens
 * Supports optional authentication - if no token provided, continues without user info
 */
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            // No token provided - continue without authentication
            return next();
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        // Invalid token - return error
        res.status(401).json({
            success: false,
            error: 'Invalid token',
            message: 'Please provide a valid authentication token',
            timestamp: Date.now()
        });
    }
};
exports.auth = auth;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No auth provided, continue without user
            return next();
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.userId,
                address: decoded.address,
            };
            req.token = token;
        }
        catch (jwtError) {
            // Invalid token, but continue without user (optional auth)
            console.warn('Invalid token in optional auth:', jwtError);
        }
        next();
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue even if there's an error
    }
};
exports.optionalAuth = optionalAuth;
const generateToken = (userId, address) => {
    return jsonwebtoken_1.default.sign({
        userId,
        address,
    }, JWT_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.js.map