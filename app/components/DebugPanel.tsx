'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      checkDatabase();
    }
  };

  const checkDatabase = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });
      
      if (connectionError) {
        throw new Error(`Supabase connection error: ${connectionError.message}`);
      }
      
      // Check user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      let userExists = true;
      if (userError) {
        if (userError.code === 'PGRST116') {
          // User not found
          userExists = false;
          addLog(`User record not found for ID: ${user.id}`);
        } else {
          throw new Error(`User record error: ${userError.message}`);
        }
      }
      
      // Check tips table
      const { data: tipsData, error: tipsError } = await supabase
        .from('tips')
        .select('*')
        .eq('user_id', user.id);
      
      if (tipsError) {
        throw new Error(`Tips table error: ${tipsError.message}`);
      }
      
      // Check user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);
      
      // This might not exist yet, so don't throw an error
      
      setDbInfo({
        connection: 'OK',
        userExists,
        user: userData || null,
        tips: {
          count: tipsData?.length || 0,
          data: tipsData
        },
        settings: settingsData || 'Not found'
      });
      
      addLog('Database check completed successfully');
    } catch (err: any) {
      setError(err.message);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createUserRecord = async () => {
    if (!user) return;
    
    addLog(`Creating user record for ID: ${user.id}`);
    
    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!checkError && existingUser) {
        addLog('User record already exists');
        await checkDatabase();
        return;
      }
      
      // Create user record
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          is_paid: false
        }])
        .select();
      
      if (error) {
        throw new Error(`Error creating user record: ${error.message}`);
      }
      
      addLog(`User record created successfully: ${JSON.stringify(data)}`);
      
      // Refresh database info
      await checkDatabase();
    } catch (err: any) {
      setError(err.message);
      addLog(`Error: ${err.message}`);
    }
  };

  const testTipInsert = async () => {
    if (!user) return;
    
    addLog('Testing tip insert...');
    
    try {
      // First ensure user record exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          // User not found, create user record first
          addLog('User record not found, creating it first...');
          await createUserRecord();
        } else {
          throw new Error(`Error checking user existence: ${checkError.message}`);
        }
      }
      
      // Generate a test date (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const testDate = yesterday.toISOString().split('T')[0];
      
      // Try to insert a test tip directly
      const { data, error } = await supabase
        .from('tips')
        .insert([{
          user_id: user.id,
          date: testDate,
          amount: 12345 // $123.45
        }])
        .select();
      
      if (error) {
        throw new Error(`Direct tip insert error: ${error.message}`);
      }
      
      addLog(`Test tip inserted successfully: ${JSON.stringify(data)}`);
      
      // Refresh database info
      await checkDatabase();
    } catch (err: any) {
      setError(err.message);
      addLog(`Error: ${err.message}`);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-md opacity-50 hover:opacity-100 transition-opacity z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/2 lg:w-1/3 h-1/2 bg-gray-900 text-white border-t border-l border-gray-700 rounded-tl-lg shadow-xl z-50 flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-gray-800">
        <h3 className="font-bold">Debug Panel</h3>
        <button onClick={togglePanel} className="text-gray-400 hover:text-white">
          Close
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Database Info</h4>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : dbInfo ? (
            <div className="space-y-2 text-xs">
              <p>Connection: {dbInfo.connection}</p>
              <p>User Record: {dbInfo.userExists ? 'Exists' : 'Missing'}</p>
              {!dbInfo.userExists && (
                <button
                  onClick={createUserRecord}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                >
                  Create User Record
                </button>
              )}
              {dbInfo.user && (
                <>
                  <p>User ID: {dbInfo.user?.id}</p>
                  <p>User Email: {dbInfo.user?.email}</p>
                  <p>Is Paid: {dbInfo.user?.is_paid ? 'Yes' : 'No'}</p>
                </>
              )}
              <p>Tips Count: {dbInfo.tips.count}</p>
              
              <div className="mt-2">
                <p className="font-semibold">Recent Tips:</p>
                {dbInfo.tips.count > 0 ? (
                  <ul className="space-y-1 mt-1">
                    {dbInfo.tips.data.slice(0, 5).map((tip: any) => (
                      <li key={tip.id} className="text-gray-300">
                        {tip.date}: ${(tip.amount / 100).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No tips found</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No data available</p>
          )}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Logs</h4>
          <div className="bg-gray-800 p-2 rounded-md h-32 overflow-y-auto text-xs">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="text-gray-300 mb-1">{log}</div>
              ))
            ) : (
              <p className="text-gray-500">No logs yet</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-gray-700 flex space-x-2">
        <button
          onClick={checkDatabase}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Check DB
        </button>
        <button
          onClick={createUserRecord}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Create User
        </button>
        <button
          onClick={testTipInsert}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Test Tip
        </button>
        <button
          onClick={clearLogs}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm ml-auto"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
};

export default DebugPanel; 