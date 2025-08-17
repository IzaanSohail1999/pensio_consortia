import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id?: string;
  username?: string;
  role?: string;
  email?: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

export interface AuthenticatedAdminRequest extends NextApiRequest {
  admin?: {
    username: string;
    email?: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res.status(500).json({ message: 'Server configuration error' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.user = {
          id: decoded.id || '',
          username: decoded.username || '',
          role: decoded.role
        };
      } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      return handler(req, res);
    } catch (error) {
      console.error('[AUTH MIDDLEWARE] Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export function withAdminAuth(handler: (req: AuthenticatedAdminRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedAdminRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res.status(500).json({ message: 'Server configuration error' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        req.admin = {
          username: decoded.username || '',
          email: decoded.email
        };
      } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      return handler(req, res);
    } catch (error) {
      console.error('[ADMIN AUTH MIDDLEWARE] Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
