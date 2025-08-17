import React, { useState, useEffect } from 'react';
import styles from '@/styles/style.module.css';
import CountrySelector from '@/components/CountrySelector';
import { Country, countries } from '@/constants/countries';

interface GeolocationSettings {
  isEnabled: boolean;
  restrictedCountries: string[];
  lastModified: Date;
  modifiedBy: string;
}

const GeolocationPage = () => {
  const [settings, setSettings] = useState<GeolocationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  // Get admin username from context or localStorage (you can enhance this later)
  const getAdminUsername = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminUsername') || 'admin';
    }
    return 'admin';
  };

  const refreshSettings = async () => {
    try {
      const response = await fetch('/api/admin/geolocation');
      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  useEffect(() => {
    // Fetch real geolocation settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/geolocation');
        const data = await response.json();
        
        if (data.success && data.data) {
          setSettings(data.data);
        } else {
          console.error('Failed to fetch settings:', data.message);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleGeolocation = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/geolocation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle',
          adminUsername: getAdminUsername()
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
        setSuccess(`Geolocation ${data.data.isEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        setError(data.message || 'Failed to update geolocation settings');
      }
    } catch {
      setError('Failed to update geolocation settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCountry = async (country: Country) => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (settings.restrictedCountries.includes(country.code)) {
        setError('Country is already in the restricted list');
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/admin/geolocation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addCountry',
          countryCode: country.code,
          adminUsername: getAdminUsername()
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
        setSuccess(`${country.flag} ${country.name} added to restricted list successfully`);
      } else {
        setError(data.message || 'Failed to add country to restricted list');
      }
    } catch {
      setError('Failed to add country to restricted list');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCountry = async (countryCode: string) => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/geolocation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'removeCountry',
          countryCode: countryCode,
          adminUsername: getAdminUsername()
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
        setSuccess('Country removed from restricted list successfully');
      } else {
        setError(data.message || 'Failed to remove country from restricted list');
      }
    } catch {
      setError('Failed to remove country from restricted list');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-400">Loading geolocation settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
        {/* <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className={styles.pageTitle}>Geolocation Settings</h1>
            <p className={styles.pageSubtitle}>Manage location-based access restrictions for your platform</p>
          </div>
                     <div className="flex gap-2">
             <button
               onClick={refreshSettings}
               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
               title="Refresh settings"
             >
               🔄 Refresh
             </button>
             <a
               href="/geolocation-test"
               target="_blank"
               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
               title="Test geolocation"
             >
               🧪 Test Geolocation
             </a>
           </div>
        </div> */}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Toggle Card */}
          <div className="bg-[#1e2a46] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Geolocation Access Control</h2>
                <p className="text-gray-300">Enable or disable location-based restrictions</p>
              </div>
              <div className="flex items-center">
                <span className={`mr-3 text-sm font-medium ${settings?.isEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                  {settings?.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleGeolocation}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings?.isEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>When enabled, users from restricted countries will be blocked from accessing the platform.</p>
            </div>
          </div>

          {/* Countries Card */}
          <div className="bg-[#1e2a46] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Restricted Countries</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">
                Select countries from the dropdown to restrict access from those locations
              </p>
              <div className="max-w-md">
                <CountrySelector
                  onSelect={handleAddCountry}
                  excludedCountries={settings?.restrictedCountries || []}
                  placeholder="Click to select a country..."
                  className="w-full"
                />
              </div>
            </div>

            {settings?.restrictedCountries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No restricted countries configured</p>
                <p className="text-sm">Add countries above to start restricting access</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Currently Restricted:</h3>
                <div className="flex flex-wrap gap-2">
                  {settings?.restrictedCountries.map((countryCode) => {
                    const country = countries.find(c => c.code === countryCode);
                    return (
                      <div
                        key={countryCode}
                        className="flex items-center gap-2 px-3 py-2 bg-red-900 text-red-200 rounded-lg text-sm"
                      >
                        <span className="text-lg">{country?.flag || '🏳️'}</span>
                        <div className="flex-1">
                          <div className="font-medium">{country?.name || countryCode}</div>
                          <div className="text-xs text-red-300">{countryCode} • {country?.region || 'Unknown'}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveCountry(countryCode)}
                          disabled={isSaving}
                          className="text-red-300 hover:text-red-100 disabled:opacity-50 p-1 rounded-full hover:bg-red-800"
                          title="Remove country"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status Card */}
          <div className="bg-[#1e2a46] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#2c344f] rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {settings?.isEnabled ? '🟢' : '🔴'}
                </div>
                <div className="text-sm text-gray-300">Status</div>
                <div className="text-lg font-semibold text-white">
                  {settings?.isEnabled ? 'Active' : 'Inactive'}
                </div>
             </div>
              
              <div className="text-center p-4 bg-[#2c344f] rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {settings?.restrictedCountries.length}
                </div>
                <div className="text-sm text-gray-300">Restricted Countries</div>
                <div className="text-lg font-semibold text-white">
                  {settings?.restrictedCountries.length === 0 ? 'None' : `${settings?.restrictedCountries.length} country${settings?.restrictedCountries.length === 1 ? '' : 'ies'}`}
                </div>
              </div>
              
              <div className="text-center p-4 bg-[#2c344f] rounded-lg">
                <div className="text-2xl font-bold text-white">👤</div>
                <div className="text-sm text-gray-300">Last Modified</div>
                <div className="text-lg font-semibold text-white">
                  {settings?.lastModified ? new Date(settings.lastModified).toLocaleDateString() : 'Never'}
                </div>
               </div>
             </div>
           </div>

           {/* Test Card */}
           <div className="bg-[#1e2a46] rounded-lg p-6">
             <h2 className="text-xl font-semibold text-white mb-4">🧪 Test Geolocation</h2>
             
             <div className="space-y-4">
               <p className="text-gray-300 text-sm">
                 Test your geolocation settings to ensure they&apos;re working correctly.
               </p>
               
               <div className="flex flex-wrap gap-2">
                 <button
                   onClick={() => window.open('/geolocation-test', '_blank')}
                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                 >
                   🧪 Open Test Page
                 </button>
                 
                 <button
                   onClick={() => window.open('/api/geolocation/check', '_blank')}
                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                 >
                   🔍 Check Current Location
                 </button>
                 
                 <button
                   onClick={() => window.open('/api/geolocation/debug', '_blank')}
                   className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                 >
                   🐛 Debug Info
                 </button>
                 
                 <button
                   onClick={() => window.open('/api/geolocation/check?test_country=PK', '_blank')}
                   className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                 >
                   🧪 Test PK Blocking
                 </button>
               </div>
               
                                <div className="text-xs text-gray-400">
                   <p>• <strong>Test Page:</strong> Interactive testing interface</p>
                   <p>• <strong>Check Location:</strong> Raw API response</p>
                   <p>• <strong>Debug Info:</strong> Detailed IP and header information</p>
                 </div>
                 
                 <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-600">
                   <p className="text-yellow-200 text-xs">
                     <strong>💡 Quick Test:</strong> Add <code className="bg-yellow-800 px-1 rounded">?test_country=PK</code> to any URL to simulate access from Pakistan
                   </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default GeolocationPage;
