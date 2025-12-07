"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding, cb) {
        const responseTime = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTime,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            timestamp: new Date().toISOString()
        };
        if (res.statusCode >= 400) {
            console.error('HTTP Error:', logData);
        }
        else if (responseTime > 1000) {
            console.warn('Slow Request:', logData);
        }
        else if (process.env.NODE_ENV === 'development') {
            console.log('HTTP Request:', logData);
        }
        if (typeof chunk === 'function') {
            return originalEnd(chunk);
        }
        else if (typeof encoding === 'function') {
            return originalEnd(chunk, encoding);
        }
        else {
            return originalEnd(chunk, encoding, cb);
        }
    };
    next();
};
exports.requestLogger = requestLogger;
const performanceMonitor = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        if (duration > 500) {
            console.warn(`Slow request detected: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
        }
    });
    next();
};
exports.performanceMonitor = performanceMonitor;
