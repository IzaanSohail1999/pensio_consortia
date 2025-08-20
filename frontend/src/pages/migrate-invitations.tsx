import { useState } from 'react';

export default function MigrateInvitations() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');

  const runMigration = async () => {
    setIsRunning(true);
    setResult('Running migration...');
    
    try {
      const response = await fetch('/api/invitations/migrate', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ ${data.message}\n\nDetails: ${JSON.stringify(data.data, null, 2)}`);
      } else {
        setResult(`❌ Migration failed: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Invitation Migration Tool</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-300 mb-6">
            This tool will update all existing invitations from the old schema (isUsed field) 
            to the new schema (status field).
          </p>
          
          <button
            onClick={runMigration}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
          >
            {isRunning ? 'Running Migration...' : 'Run Migration'}
          </button>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
