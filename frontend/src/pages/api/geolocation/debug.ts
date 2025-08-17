import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get all headers that might contain IP information
    const headers = {
      'cf-connecting-ip': req.headers['cf-connecting-ip'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'x-client-ip': req.headers['x-client-ip'],
      'x-forwarded': req.headers['x-forwarded'],
      'forwarded-for': req.headers['forwarded-for'],
      'forwarded': req.headers['forwarded'],
      'remote-addr': req.headers['remote-addr']
    };

    // Get socket information
    const socketInfo = {
      remoteAddress: req.socket.remoteAddress,
      remoteFamily: req.socket.remoteFamily,
      remotePort: req.socket.remotePort
    };

    // Get connection information
    const connectionInfo = {
      remoteAddress: req.connection?.remoteAddress,
      remotePort: req.connection?.remotePort
    };

    // Try to get IP using the same logic as the main geolocation check
    const clientIP = getClientIP(req);

    // Test geolocation with the detected IP
    let geolocationTest = null;
    if (clientIP) {
      try {
        geolocationTest = await testGeolocationServices(clientIP);
      } catch (error) {
        geolocationTest = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      clientIP,
      headers,
      socketInfo,
      connectionInfo,
      geolocationTest,
      userAgent: req.headers['user-agent'],
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });

  } catch (error) {
    logger.error('Error in geolocation debug endpoint', 'GEOLOCATION_DEBUG', { error: 'Debug endpoint error' }, error instanceof Error ? error : new Error(String(error)));
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to get client IP (same as in check.ts)
function getClientIP(req: NextApiRequest): string | null {
  // Check various headers that hosting providers use
  const headers = [
    'cf-connecting-ip',        // Cloudflare
    'x-forwarded-for',         // Standard proxy header
    'x-real-ip',              // Nginx proxy
    'x-client-ip',            // Custom headers
    'x-forwarded',            // Another proxy header
    'forwarded-for',          // Another proxy header
    'forwarded'               // RFC 7239
  ];
  
  for (const header of headers) {
    const value = req.headers[header];
    if (value && typeof value === 'string') {
      // Handle comma-separated lists (take first IP)
      const ip = value.split(',')[0].trim();
      if (ip && !isPrivateIP(ip)) {
        return ip;
      }
    }
  }
  
  // Fallback to socket address
  const socketIP = req.socket.remoteAddress;
  if (socketIP && !isPrivateIP(socketIP)) {
    return socketIP;
  }
  
  return null;
}

// Helper function to check if IP is private/localhost
function isPrivateIP(ip: string): boolean {
  if (!ip) return true;
  
  // Localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  
  // Private IP ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^fc00:/,
    /^fe80:/
  ];
  
  return privateRanges.some(range => range.test(ip));
}

// Define interfaces for geolocation data
interface GeolocationData {
  country_code?: string;
  country?: string;
  countryCode?: string;
  country_code2?: string;
  [key: string]: string | number | boolean | undefined; // For other properties we don't know about
}

interface GeolocationService {
  name: string;
  url: string;
  extractor: (data: GeolocationData) => string | undefined;
}

interface GeolocationResult {
  service: string;
  status?: number;
  statusText?: string;
  success: boolean;
  countryCode?: string | null;
  fullResponse?: GeolocationData;
  error?: string;
}

// Test all geolocation services
async function testGeolocationServices(ip: string): Promise<GeolocationResult[]> {
  const services: GeolocationService[] = [
    { name: 'ipapi.co', url: `https://ipapi.co/${ip}/json/`, extractor: (data: GeolocationData) => data.country_code },
    { name: 'ipinfo.io', url: `https://ipinfo.io/${ip}/json`, extractor: (data: GeolocationData) => data.country },
    { name: 'ip-api.com', url: `http://ip-api.com/json/${ip}`, extractor: (data: GeolocationData) => data.countryCode },
    { name: 'freegeoip.app', url: `https://freegeoip.app/json/${ip}`, extractor: (data: GeolocationData) => data.country_code },
    { name: 'ipgeolocation.io', url: `https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ip}`, extractor: (data: GeolocationData) => data.country_code2 },
    { name: 'ipapi.is', url: `https://ipapi.is/json/${ip}`, extractor: (data: GeolocationData) => data.country_code },
    { name: 'ipwho.is', url: `https://ipwho.is/${ip}`, extractor: (data: GeolocationData) => data.country_code }
  ];

  const results: GeolocationResult[] = [];

  for (const service of services) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Pensio-Geolocation-Debug/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        results.push({
          service: service.name,
          status: response.status,
          statusText: response.statusText,
          success: false
        });
        continue;
      }
      
      const data: GeolocationData = await response.json();
      const countryCode = service.extractor(data);
      
      results.push({
        service: service.name,
        status: response.status,
        success: true,
        countryCode: countryCode || null,
        fullResponse: data
      });
      
    } catch (error) {
      results.push({
        service: service.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}
