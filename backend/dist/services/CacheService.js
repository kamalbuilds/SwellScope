"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
// In-memory cache fallback when Redis is not available
const memoryCache = new Map();
class CacheService {
    redis = null;
    useRedis = false;
    constructor() {
        this.initializeRedis();
    }
    async initializeRedis() {
        try {
            // Try to initialize Redis if available
            const Redis = require('ioredis');
            this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
            // Test connection
            await this.redis.ping();
            this.useRedis = true;
            console.log('Redis cache initialized successfully');
        }
        catch (error) {
            console.warn('Redis not available, using in-memory cache:', error);
            this.useRedis = false;
        }
    }
    async get(key) {
        try {
            if (this.useRedis && this.redis) {
                const value = await this.redis.get(key);
                return value ? JSON.parse(value) : null;
            }
            else {
                // Use memory cache
                const cached = memoryCache.get(key);
                if (cached && cached.expires > Date.now()) {
                    return cached.value;
                }
                if (cached) {
                    memoryCache.delete(key); // Remove expired
                }
                return null;
            }
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds = 300) {
        try {
            if (this.useRedis && this.redis) {
                await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
                return true;
            }
            else {
                // Use memory cache
                memoryCache.set(key, {
                    value,
                    expires: Date.now() + (ttlSeconds * 1000)
                });
                return true;
            }
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    async del(key) {
        try {
            if (this.useRedis && this.redis) {
                await this.redis.del(key);
                return true;
            }
            else {
                memoryCache.delete(key);
                return true;
            }
        }
        catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }
    async exists(key) {
        try {
            if (this.useRedis && this.redis) {
                const result = await this.redis.exists(key);
                return result === 1;
            }
            else {
                const cached = memoryCache.get(key);
                return cached ? cached.expires > Date.now() : false;
            }
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
    async keys(pattern) {
        try {
            if (this.useRedis && this.redis) {
                return await this.redis.keys(pattern);
            }
            else {
                // Simple pattern matching for memory cache
                const allKeys = Array.from(memoryCache.keys());
                if (pattern === '*')
                    return allKeys;
                // Convert glob pattern to regex
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return allKeys.filter(key => regex.test(key));
            }
        }
        catch (error) {
            console.error('Cache keys error:', error);
            return [];
        }
    }
    async clear() {
        try {
            if (this.useRedis && this.redis) {
                await this.redis.flushdb();
                return true;
            }
            else {
                memoryCache.clear();
                return true;
            }
        }
        catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }
    async getMultiple(keys) {
        try {
            const result = {};
            if (this.useRedis && this.redis && keys.length > 0) {
                const values = await this.redis.mget(keys);
                keys.forEach((key, index) => {
                    result[key] = values[index] ? JSON.parse(values[index]) : null;
                });
            }
            else {
                for (const key of keys) {
                    result[key] = await this.get(key);
                }
            }
            return result;
        }
        catch (error) {
            console.error('Cache getMultiple error:', error);
            return {};
        }
    }
    async setMultiple(data, ttlSeconds = 300) {
        try {
            if (this.useRedis && this.redis) {
                const multi = this.redis.multi();
                Object.entries(data).forEach(([key, value]) => {
                    multi.setex(key, ttlSeconds, JSON.stringify(value));
                });
                await multi.exec();
                return true;
            }
            else {
                const expires = Date.now() + (ttlSeconds * 1000);
                Object.entries(data).forEach(([key, value]) => {
                    memoryCache.set(key, { value, expires });
                });
                return true;
            }
        }
        catch (error) {
            console.error('Cache setMultiple error:', error);
            return false;
        }
    }
    async increment(key, amount = 1) {
        try {
            if (this.useRedis && this.redis) {
                return await this.redis.incrby(key, amount);
            }
            else {
                const current = await this.get(key) || 0;
                const newValue = current + amount;
                await this.set(key, newValue);
                return newValue;
            }
        }
        catch (error) {
            console.error('Cache increment error:', error);
            return 0;
        }
    }
    // Cleanup expired entries in memory cache
    cleanupMemoryCache() {
        if (!this.useRedis) {
            const now = Date.now();
            for (const [key, data] of memoryCache.entries()) {
                if (data.expires <= now) {
                    memoryCache.delete(key);
                }
            }
        }
    }
    // Get cache statistics
    async getStats() {
        try {
            if (this.useRedis && this.redis) {
                const info = await this.redis.info('memory');
                const keyspace = await this.redis.info('keyspace');
                const dbKeys = keyspace.match(/keys=(\d+)/);
                return {
                    type: 'redis',
                    keys: dbKeys ? parseInt(dbKeys[1]) : 0,
                    memoryUsage: info.match(/used_memory_human:(.+)/)?.[1]?.trim()
                };
            }
            else {
                return {
                    type: 'memory',
                    keys: memoryCache.size
                };
            }
        }
        catch (error) {
            console.error('Cache stats error:', error);
            return { type: 'memory', keys: 0 };
        }
    }
}
exports.CacheService = CacheService;
// Cleanup memory cache every 10 minutes if not using Redis
const cacheService = new CacheService();
setInterval(() => {
    cacheService.cleanupMemoryCache();
}, 10 * 60 * 1000);
//# sourceMappingURL=CacheService.js.map