'use client';

import { useState } from 'react';

export default function ConnectionTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error testing connection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Test Results:</h3>
          
          <div className="space-y-4">
            <div className="p-3 border rounded">
              <h4 className="font-medium">Supabase Connection:</h4>
              <p className={`mt-1 ${result.supabase.connected ? 'text-green-600' : 'text-red-600'}`}>
                {result.supabase.connected ? 'Connected ✓' : 'Failed ✗'}
              </p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(result.supabase.result, null, 2)}
              </pre>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-medium">Postgres Connection:</h4>
              <p className={`mt-1 ${result.postgres.connected ? 'text-green-600' : 'text-red-600'}`}>
                {result.postgres.connected ? 'Connected ✓' : 'Failed ✗'}
              </p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(result.postgres.result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 