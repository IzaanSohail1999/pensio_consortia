import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export interface GeolocationCheckResult {
  isBlocked: boolean;
  isEnabled: boolean;
  userCountry?: string;
  restrictedCountries: string[];
  message: string;
}

export interface UseGeolocationReturn {
  isLoading: boolean;
  isBlocked: boolean;
  userCountry?: string;
  restrictedCountries: string[];
  message: string;
  checkGeolocation: () => Promise<void>;
  error: string | null;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [userCountry, setUserCountry] = useState<string>();
  const [restrictedCountries, setRestrictedCountries] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkGeolocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/geolocation/check');
      const data: GeolocationCheckResult = await response.json();
      
      setIsBlocked(data.isBlocked);
      setUserCountry(data.userCountry);
      setRestrictedCountries(data.restrictedCountries);
      setMessage(data.message);
      
      // If user is blocked, redirect to restricted access page
      if (data.isBlocked) {
        router.push('/restricted-access');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check geolocation';
      setError(errorMessage);
      console.error('Geolocation check error:', err);
      
      // On error, allow access (fail open)
      setIsBlocked(false);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkGeolocation();
  }, [checkGeolocation]);

  return {
    isLoading,
    isBlocked,
    userCountry,
    restrictedCountries,
    message,
    checkGeolocation,
    error
  };
};
