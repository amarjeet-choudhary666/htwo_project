"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.authenticateAdminPage = exports.authenticateUser = exports.authenticateAdmin = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const apiError_1 = require("../utils/apiError");
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            throw new apiError_1.ApiError(401, 'Access token not found. Please login as admin.');
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || !decoded.userId) {
            throw new apiError_1.ApiError(401, 'Invalid access token');
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(decoded.userId) }
        });
        if (!user) {
            throw new apiError_1.ApiError(401, 'User not found');
        }
        if (user.role !== 'ADMIN') {
            throw new apiError_1.ApiError(403, 'Access denied. Admin privileges required.');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof apiError_1.ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const authenticateUser = async (req, res, next) => {
    try {
        let token = req.cookies.accessToken;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            throw new apiError_1.ApiError(401, 'Access token not found. Please login first.');
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || !decoded.userId) {
            throw new apiError_1.ApiError(401, 'Invalid access token');
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(decoded.userId) }
        });
        if (!user) {
            throw new apiError_1.ApiError(401, 'User not found');
        }
        if (user.role !== 'USER' && user.role !== 'PARTNER') {
            throw new apiError_1.ApiError(403, 'Access denied. User or Partner account required.');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof apiError_1.ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        console.error('User auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during user authentication'
        });
    }
};
exports.authenticateUser = authenticateUser;
const authenticateAdminPage = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.redirect('/api/v1/users/admin/login?error=Please login as admin first');
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || !decoded.userId) {
            return res.redirect('/api/v1/users/admin/login?error=Invalid session. Please login again');
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(decoded.userId) }
        });
        if (!user) {
            return res.redirect('/api/v1/users/admin/login?error=User not found. Please login again');
        }
        if (user.role !== 'ADMIN') {
            return res.redirect('/api/v1/users/admin/login?error=Access denied. Admin privileges required');
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Page auth middleware error:', error);
        return res.redirect('/api/v1/users/admin/login?error=Authentication failed. Please login again');
    }
};
exports.authenticateAdminPage = authenticateAdminPage;
const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies.accessToken;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            throw new apiError_1.ApiError(401, 'Access token not found. Please login first.');
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || !decoded.userId) {
            throw new apiError_1.ApiError(401, 'Invalid access token');
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(decoded.userId) }
        });
        if (!user) {
            throw new apiError_1.ApiError(401, 'User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof apiError_1.ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};
exports.authMiddleware = authMiddleware;
