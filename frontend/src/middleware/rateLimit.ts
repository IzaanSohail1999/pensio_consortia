import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

export function withRateLimit(
  config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = getClientIdentifier(req);
      const now = Date.now();
      
      // Clean up expired entries
      if (rateLimitStore[clientId] && now > rateLimitStore[clientId].resetTime) {
        delete rateLimitStore[clientId];
      }
      
      // Initialize or get current rate limit data
      if (!rateLimitStore[clientId]) {
        rateLimitStore[clientId] = {
          count: 0,
          resetTime: now + config.windowMs
        };
      }
      
      // Check if rate limit exceeded
      if (rateLimitStore[clientId].count >= config.maxRequests) {
        const resetTime = new Date(rateLimitStore[clientId].resetTime).toISOString();
        return res.status(429).json({
          message: config.message || 'Too many requests',
          retryAfter: resetTime,
          limit: config.maxRequests,
          windowMs: config.windowMs
        });
      }
      
      // Increment counter
      rateLimitStore[clientId].count++;
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config.maxRequests - rateLimitStore[clientId].count);
      res.setHeader('X-RateLimit-Reset', rateLimitStore[clientId].resetTime);
      
      return handler(req, res);
    };
  };
}

// Stricter rate limiting for auth endpoints
export function withStrictRateLimit(
  config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 5 }
) {
  return withRateLimit(config);
}

function getClientIdentifier(req: NextApiRequest): string {
  // Use IP address as primary identifier
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.socket.remoteAddress || 
             'unknown';
  
  // For additional security, include user agent
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  return `${ip}-${userAgent}`;
}

// Clean up expired rate limit entries periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key] && now > rateLimitStore[key].resetTime) {
        delete rateLimitStore[key];
      }
    });
  }, 60000); // Clean up every minute
}
