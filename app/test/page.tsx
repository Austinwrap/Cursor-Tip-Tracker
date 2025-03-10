import ConnectionTest from '@/app/components/ConnectionTest';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test Page</h1>
      <p className="mb-6 text-gray-600">
        This page tests both your Supabase client connection and direct Postgres connection.
        Click the button below to run the test.
      </p>
      
      <ConnectionTest />
      
      <div className="mt-8 p-4 bg-gray-50 border rounded">
        <h2 className="text-lg font-semibold mb-2">How this works:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>The Supabase client uses your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li>The Postgres connection uses your <code>DATABASE_URL</code> with direct SQL queries</li>
          <li>Both connections attempt to count the number of records in your <code>tips</code> table</li>
          <li>If successful, you'll see the count results below</li>
        </ul>
      </div>
    </div>
  );
} 