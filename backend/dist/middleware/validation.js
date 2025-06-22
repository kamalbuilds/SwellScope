"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateNumericParam = exports.validateTimeRange = exports.validatePagination = exports.validateAddress = exports.validateBody = exports.validateQueryParams = void 0;
const validateQueryParams = (requiredParams) => {
    return (req, res, next) => {
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
exports.validateQueryParams = validateQueryParams;
const validateBody = (requiredFields, optionalFields = []) => {
    return (req, res, next) => {
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
exports.validateBody = validateBody;
const validateAddress = (addressField = 'address') => {
    return (req, res, next) => {
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
exports.validateAddress = validateAddress;
const validatePagination = () => {
    return (req, res, next) => {
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
exports.validatePagination = validatePagination;
const validateTimeRange = () => {
    return (req, res, next) => {
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
exports.validateTimeRange = validateTimeRange;
const validateNumericParam = (paramName, min, max) => {
    return (req, res, next) => {
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
exports.validateNumericParam = validateNumericParam;
const validateQuery = (allowedParams) => {
    return (req, res, next) => {
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
exports.validateQuery = validateQuery;
//# sourceMappingURL=validation.js.map