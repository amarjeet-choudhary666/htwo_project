import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(401, 'Access token not found. Please login as admin.');
    }

    // Verify token
    const decoded = verifyAccessToken(token) as { userId: string };

    if (!decoded || !decoded.userId) {
      throw new ApiError(401, 'Invalid access token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) }
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Check if user has ADMIN role
    if (user.role !== 'ADMIN') {
      throw new ApiError(403, 'Access denied. Admin privileges required.');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof ApiError) {
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

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies.accessToken;

    // Check Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new ApiError(401, 'Access token not found. Please login first.');
    }

    // Verify token
    const decoded = verifyAccessToken(token) as { userId: string };

    if (!decoded || !decoded.userId) {
      throw new ApiError(401, 'Invalid access token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) }
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Check if user has USER or PARTNER role
    if (user.role !== 'USER' && user.role !== 'PARTNER') {
      throw new ApiError(403, 'Access denied. User or Partner account required.');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof ApiError) {
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

export const authenticateAdminPage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken;

    if (!token) {
      return res.redirect('/api/v1/users/admin/login?error=Please login as admin first');
    }

    // Verify token
    const decoded = verifyAccessToken(token) as { userId: string };

    if (!decoded || !decoded.userId) {
      return res.redirect('/api/v1/users/admin/login?error=Invalid session. Please login again');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) }
    });

    if (!user) {
      return res.redirect('/api/v1/users/admin/login?error=User not found. Please login again');
    }

    // Check if user has ADMIN role
    if (user.role !== 'ADMIN') {
      return res.redirect('/api/v1/users/admin/login?error=Access denied. Admin privileges required');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Page auth middleware error:', error);
    return res.redirect('/api/v1/users/admin/login?error=Authentication failed. Please login again');
  }
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies.accessToken;

    // Check Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new ApiError(401, 'Access token not found. Please login first.');
    }

    // Verify token
    const decoded = verifyAccessToken(token) as { userId: string };

    if (!decoded || !decoded.userId) {
      throw new ApiError(401, 'Invalid access token');
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) }
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof ApiError) {
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