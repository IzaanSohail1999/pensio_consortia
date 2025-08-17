import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import AdminSettingsManager from '../_db/adminSettings';
import { logger } from '@/utils/logger';

export interface GeolocationCheckResult {
  isBlocked: boolean;
  isEnabled: boolean;
  userCountry?: string;
  restrictedCountries: string[];
  message: string;
  debug?: {
    clientIP: string | null;
    originalCountry: string | null;
    testCountry?: string;
    finalCountry: string;
    geolocationService: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    // Get current geolocation settings
    const settings = await AdminSettingsManager.getGeolocationSettings();
    
    if (!settings) {
      // If no settings exist, geolocation is not enabled
      return res.status(200).json({
        isBlocked: false,
        isEnabled: false,
        restrictedCountries: [],
        message: 'Geolocation restrictions not configured'
      });
    }

    // If geolocation is disabled, no blocking
    if (!settings.isEnabled) {
      return res.status(200).json({
        isBlocked: false,
        isEnabled: false,
        restrictedCountries: settings.restrictedCountries,
        message: 'Geolocation restrictions are disabled'
      });
    }

    // Get user's IP address
    const clientIP = getClientIP(req);
    logger.info(`Client IP detected: ${clientIP}`, 'GEOLOCATION');
    
    if (!clientIP) {
      // If we can't get IP, allow access (fail open)
      logger.warn('Could not determine client IP - allowing access', 'GEOLOCATION');
      return res.status(200).json({
        isBlocked: false,
        isEnabled: true,
        userCountry: 'UNKNOWN',
        restrictedCountries: settings.restrictedCountries,
        message: 'Could not determine IP - access allowed'
      });
    }

    // Get country from IP address using multiple fallback services
    const userCountry = await getCountryFromIPWithFallbacks(clientIP);
    logger.info(`Country detected: ${userCountry || 'UNKNOWN'}`, 'GEOLOCATION');
    
    // For testing purposes, you can force a specific country by adding ?test_country=PK to the URL
    const testCountry = req.query.test_country as string;
    const finalUserCountry = testCountry || userCountry;
    logger.info(`Final country (with test override): ${finalUserCountry || 'UNKNOWN'}`, 'GEOLOCATION');
    
    if (!finalUserCountry) {
      // If we can't determine country, allow access (fail open)
      logger.warn('Could not determine country - allowing access', 'GEOLOCATION');
      return res.status(200).json({
        isBlocked: false,
        isEnabled: true,
        userCountry: 'UNKNOWN',
        restrictedCountries: settings.restrictedCountries,
        message: 'Could not determine location - access allowed'
      });
    }

    // Check if user's country is in restricted list
    const isBlocked = settings.restrictedCountries.includes(finalUserCountry);
    logger.info(`Access decision: ${isBlocked ? 'BLOCKED' : 'ALLOWED'} for country ${finalUserCountry}`, 'GEOLOCATION');
    
    const response: GeolocationCheckResult = {
      isBlocked,
      isEnabled: true,
      userCountry: finalUserCountry,
      restrictedCountries: settings.restrictedCountries,
      message: isBlocked 
        ? `Access blocked from ${finalUserCountry}` 
        : `Access allowed from ${finalUserCountry}`
    };

    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        clientIP,
        originalCountry: userCountry,
        testCountry,
        finalCountry: finalUserCountry,
        geolocationService: 'multiple_fallbacks'
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Error checking geolocation', 'GEOLOCATION', { error: 'Geolocation check failed' }, error instanceof Error ? error : new Error(String(error)));
    // Fail open - allow access if there's an error
    return res.status(200).json({
      isBlocked: false,
      isEnabled: false,
      restrictedCountries: [],
      message: 'Error checking geolocation - access allowed'
    });
  }
}

// Helper function to get client IP
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
        logger.debug(`Found IP from header ${header}: ${ip}`, 'GEOLOCATION');
        return ip;
      }
    }
  }
  
  // Fallback to socket address
  const socketIP = req.socket.remoteAddress;
  if (socketIP && !isPrivateIP(socketIP)) {
    logger.debug(`Found IP from socket: ${socketIP}`, 'GEOLOCATION');
    return socketIP;
  }
  
  logger.debug('Could not determine client IP from any source', 'GEOLOCATION');
  return null;
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

// Helper function to get country from IP using multiple fallback services
async function getCountryFromIPWithFallbacks(ip: string): Promise<string | null> {
  // Skip localhost and private IPs
  if (isPrivateIP(ip)) {
    logger.debug(`Skipping private IP: ${ip}`, 'GEOLOCATION');
    return null;
  }

  // Try multiple geolocation services in sequence
  const services: GeolocationService[] = [
    { name: 'ipapi.co', url: `https://ipapi.co/${ip}/json/`, extractor: (data: GeolocationData) => data.country_code },
    { name: 'ipinfo.io', url: `https://ipinfo.io/${ip}/json`, extractor: (data: GeolocationData) => data.country },
    { name: 'ip-api.com', url: `https://ip-api.com/json/${ip}`, extractor: (data: GeolocationData) => data.countryCode },
    { name: 'freegeoip.app', url: `https://freegeoip.app/json/${ip}`, extractor: (data: GeolocationData) => data.country_code },
    { name: 'ipgeolocation.io', url: `https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ip}`, extractor: (data: GeolocationData) => data.country_code2 },
    { name: 'ipapi.is', url: `https://ipapi.is/json/${ip}`, extractor: (data: GeolocationData) => data.country_code },
    { name: 'ipwho.is', url: `https://ipwho.is/${ip}`, extractor: (data: GeolocationData) => data.country_code }
  ];

  for (const service of services) {
    try {
      logger.debug(`Trying ${service.name} for IP: ${ip}`, 'GEOLOCATION');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Pensio-Geolocation/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        logger.debug(`${service.name} returned status: ${response.status}`, 'GEOLOCATION');
        continue;
      }
      
      const data: GeolocationData = await response.json();
      const countryCode = service.extractor(data);
      
      if (countryCode && typeof countryCode === 'string' && countryCode.length === 2) {
        logger.info(`Successfully got country ${countryCode} from ${service.name}`, 'GEOLOCATION');
        return countryCode.toUpperCase();
      }
      
      logger.debug(`${service.name} returned invalid data`, 'GEOLOCATION', data);
      
    } catch (error) {
      logger.debug(`Error with ${service.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'GEOLOCATION');
      continue;
    }
  }
  
  logger.warn(`All geolocation services failed for IP: ${ip}`, 'GEOLOCATION');
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
