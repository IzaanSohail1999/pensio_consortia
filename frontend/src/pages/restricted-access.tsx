import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface GeolocationCheckResult {
  isBlocked: boolean;
  isEnabled: boolean;
  userCountry?: string;
  restrictedCountries: string[];
  message: string;
}

const RestrictedAccessPage = () => {
  const router = useRouter();
  const [geolocationData, setGeolocationData] = useState<GeolocationCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkGeolocation = async () => {
      try {
        const response = await fetch('/api/geolocation/check');
        const data: GeolocationCheckResult = await response.json();
        setGeolocationData(data);
        
        // If user is not blocked, redirect to home
        if (!data.isBlocked) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking geolocation:', error);
        // If there's an error, allow access
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkGeolocation();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!geolocationData?.isBlocked) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🚫</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-xl text-red-200">
            We&apos;re sorry, but we cannot provide access to our platform from your current location.
          </p>
        </div>

        {/* Main Message */}
        <div className="bg-red-800 bg-opacity-50 rounded-lg p-8 mb-8 border border-red-600">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Location-Based Restriction
          </h2>
          <p className="text-red-100 text-lg mb-6">
            Our platform is currently restricted in your region ({geolocationData.userCountry}) due to regulatory or business requirements.
          </p>
          
          <div className="bg-red-700 bg-opacity-30 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">
              <strong>Your Location:</strong> {geolocationData.userCountry || 'Unknown'}
            </p>
            <p className="text-red-200 text-sm">
              <strong>Restricted Regions:</strong> {geolocationData.restrictedCountries.join(', ') || 'None'}
            </p>
          </div>

          <p className="text-red-100">
            We apologize for any inconvenience this may cause. Please check back later or contact our support team if you believe this is an error.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            🔄 Try Again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-800 transition-colors"
          >
            🏠 Go to Homepage
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-red-300 text-sm">
          <p>
            If you believe you should have access, please contact our support team.
          </p>
          <p className="mt-2">
            This restriction is temporary and may be lifted in the future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestrictedAccessPage;
