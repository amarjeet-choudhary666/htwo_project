"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheMiddleware = void 0;
const cache = new Map();
const cacheMiddleware = (options = {}) => {
    const { ttl = 300, key = (req) => req.originalUrl } = options;
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = key(req);
        const cached = cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached.data);
        }
        const originalJson = res.json;
        res.json = function (data) {
            cache.set(cacheKey, {
                data,
                expires: Date.now() + (ttl * 1000)
            });
            res.setHeader('X-Cache', 'MISS');
            res.setHeader('Cache-Control', `public, max-age=${ttl}`);
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (value.expires <= now) {
            cache.delete(key);
        }
    }
}, 60000);
const clearCache = (pattern) => {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    }
    else {
        cache.clear();
    }
};
exports.clearCache = clearCache;
