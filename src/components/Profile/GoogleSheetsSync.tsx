import React, { useState } from 'react';
import { Loader2, Database, TableProperties, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import firebaseConfig from '../../../firebase-applet-config.json';

export default function GoogleSheetsSync({ userProfile }: { userProfile: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSync = () => {
    setLoading(true);
    
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: async (response: any) => {
          if (response.error) {
            console.error('OAuth error:', response.error);
            setLoading(false);
            return;
          }
          
          const accessToken = response.access_token;
          await exportToSheets(accessToken);
        }
      });
      client.requestAccessToken();
    } catch (err) {
      console.error('Failed to init token client', err);
      setLoading(false);
    }
  };

  const exportToSheets = async (accessToken: string) => {
    try {
      // 1. Create a new Spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `Agro Vanguard Farm Data - ${userProfile?.fullName || 'User'}`
          },
          sheets: [
            { properties: { title: "Farmer Profile" } }
          ]
        })
      });
      
      const spreadsheet = await createRes.json();
      const spreadsheetId = spreadsheet.spreadsheetId;
      
      // 2. Append Data
      const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [
            ["ID", "Name", "Email", "Phone", "Language", "Last Login"],
            [user?.uid, userProfile?.fullName, userProfile?.email, userProfile?.phoneNumber, userProfile?.preferredLanguage, new Date().toISOString()]
          ]
        })
      });
      
      if (appendRes.ok) {
        setSynced(true);
      }
      
    } catch (err) {
      console.error('Sheet Export Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
        <Database className="h-4 w-4 mr-2 text-gray-500" />
        Data Export & Sync
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Securely backup your farm profile and active sensor logs to Google Sheets.
      </p>
      
      <button 
        onClick={handleSync}
        disabled={loading || synced}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-xl transition-colors font-bold ${synced ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : synced ? (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Synced to Google Sheets
          </>
        ) : (
          <>
            <TableProperties className="h-5 w-5 mr-2 text-green-600" />
            Connect & Sync to Sheets
          </>
        )}
      </button>
    </div>
  );
}
