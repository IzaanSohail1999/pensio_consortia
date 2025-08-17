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
    
    if (!clientIP) {
      // If we can't get IP, allow access (fail open)
      return res.status(200).json({
        isBlocked: false,
        isEnabled: true,
        userCountry: 'UNKNOWN',
        restrictedCountries: settings.restrictedCountries,
        message: 'Could not determine IP - access allowed'
      });
    }

    // Get country from IP address
    const userCountry = await getCountryFromIP(clientIP);
    
    // For testing purposes, you can force a specific country by adding ?test_country=US to the URL
    const testCountry = req.query.test_country as string;
    const finalUserCountry = testCountry || userCountry;
    
    if (!finalUserCountry) {
      // If we can't determine country, allow access (fail open)
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
        finalCountry: finalUserCountry
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
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  if (cfConnectingIP && typeof cfConnectingIP === 'string') {
    return cfConnectingIP;
  }
  
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP && typeof realIP === 'string') {
    return realIP;
  }
  
  return req.socket.remoteAddress || null;
}

// Helper function to get country from IP
async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    // Use ipapi.co service (free tier available)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    if (data.country_code) {
      return data.country_code;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting country from IP:', error);
    return null;
  }
}
