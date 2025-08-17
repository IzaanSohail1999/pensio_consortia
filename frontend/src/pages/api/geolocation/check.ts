import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../_db/mongoConnect';
import AdminSettingsManager from '../_db/adminSettings';

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
    console.log(`[GEOLOCATION] Client IP detected: ${clientIP}`);
    
    if (!clientIP) {
      // If we can't get IP, allow access (fail open)
      console.log('[GEOLOCATION] Could not determine client IP - allowing access');
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
    console.log(`[GEOLOCATION] Country detected: ${userCountry || 'UNKNOWN'}`);
    
    // For testing purposes, you can force a specific country by adding ?test_country=PK to the URL
    const testCountry = req.query.test_country as string;
    const finalUserCountry = testCountry || userCountry;
    console.log(`[GEOLOCATION] Final country (with test override): ${finalUserCountry || 'UNKNOWN'}`);
    
    if (!finalUserCountry) {
      // If we can't determine country, allow access (fail open)
      console.log('[GEOLOCATION] Could not determine country - allowing access');
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
    console.log(`[GEOLOCATION] Access decision: ${isBlocked ? 'BLOCKED' : 'ALLOWED'} for country ${finalUserCountry}`);
    
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
    console.error('[GEOLOCATION CHECK] Error:', error);
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
        console.log(`Found IP from header ${header}: ${ip}`);
        return ip;
      }
    }
  }
  
  // Fallback to socket address
  const socketIP = req.socket.remoteAddress;
  if (socketIP && !isPrivateIP(socketIP)) {
    console.log(`Found IP from socket: ${socketIP}`);
    return socketIP;
  }
  
  console.log('Could not determine client IP from any source');
  return null;
}

// Helper function to get country from IP using multiple fallback services
async function getCountryFromIPWithFallbacks(ip: string): Promise<string | null> {
  // Skip localhost and private IPs
  if (isPrivateIP(ip)) {
    console.log(`Skipping private IP: ${ip}`);
    return null;
  }

  // Try multiple geolocation services in sequence
  const services = [
    { name: 'ipapi.co', url: `https://ipapi.co/${ip}/json/`, extractor: (data: any) => data.country_code },
    { name: 'ipinfo.io', url: `https://ipinfo.io/${ip}/json`, extractor: (data: any) => data.country },
    { name: 'ip-api.com', url: `http://ip-api.com/json/${ip}`, extractor: (data: any) => data.countryCode },
    { name: 'freegeoip.app', url: `https://freegeoip.app/json/${ip}`, extractor: (data: any) => data.country_code },
    { name: 'ipgeolocation.io', url: `https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ip}`, extractor: (data: any) => data.country_code2 },
    { name: 'ipapi.is', url: `https://ipapi.is/json/${ip}`, extractor: (data: any) => data.country_code },
    { name: 'ipwho.is', url: `https://ipwho.is/${ip}`, extractor: (data: any) => data.country_code }
  ];

  for (const service of services) {
    try {
      console.log(`Trying ${service.name} for IP: ${ip}`);
      
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
        console.log(`${service.name} returned status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const countryCode = service.extractor(data);
      
      if (countryCode && typeof countryCode === 'string' && countryCode.length === 2) {
        console.log(`Successfully got country ${countryCode} from ${service.name}`);
        return countryCode.toUpperCase();
      }
      
      console.log(`${service.name} returned invalid data:`, data);
      
         } catch (error) {
       console.log(`Error with ${service.name}:`, error instanceof Error ? error.message : 'Unknown error');
       continue;
     }
  }
  
  console.log(`All geolocation services failed for IP: ${ip}`);
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
