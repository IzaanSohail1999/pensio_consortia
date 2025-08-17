import React, { useState } from 'react';

interface GeolocationCheckData {
  success: boolean;
  data?: {
    countryCode?: string;
    isBlocked?: boolean;
    message?: string;
  };
  message?: string;
}

interface DebugData {
  clientIP?: string;
  headers?: Record<string, string>;
  services?: Array<{
    service: string;
    success: boolean;
    countryCode?: string;
    error?: string;
  }>;
}

interface TestResults {
  timestamp: string;
  geolocationCheck?: GeolocationCheckData;
  debugInfo?: DebugData;
  testCountry?: string;
  result?: GeolocationCheckData;
}

const GeolocationTestPage = () => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test the main geolocation check
      const checkResponse = await fetch('/api/geolocation/check');
      const checkData = await checkResponse.json();
      
      // Test the debug endpoint
      const debugResponse = await fetch('/api/geolocation/debug');
      const debugData = await debugResponse.json();
      
      setTestResults({
        timestamp: new Date().toISOString(),
        geolocationCheck: checkData,
        debugInfo: debugData
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const testWithCountry = async (countryCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/geolocation/check?test_country=${countryCode}`);
      const data = await response.json();
      
      setTestResults({
        timestamp: new Date().toISOString(),
        testCountry: countryCode,
        result: data
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🌍 Geolocation Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Running...' : '🔍 Run Full Test'}
            </button>
            
            <button
              onClick={() => testWithCountry('PK')}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              🧪 Test Pakistan Blocking
            </button>
            
            <button
              onClick={() => testWithCountry('US')}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              🧪 Test US Access
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            This page helps debug geolocation issues. Use the buttons above to test different scenarios.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">Error: {error}</span>
            </div>
          </div>
        )}

        {testResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 How to Use</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <strong>Run Full Test:</strong> Tests both geolocation check and debug endpoints</li>
            <li>• <strong>Test Pakistan Blocking:</strong> Simulates access from Pakistan (should be blocked)</li>
            <li>• <strong>Test US Access:</strong> Simulates access from US (should be allowed)</li>
            <li>• Check the console logs for detailed debugging information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeolocationTestPage;
