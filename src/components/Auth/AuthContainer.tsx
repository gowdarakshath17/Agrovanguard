import React, { useState } from 'react';
import EmailAuth from './EmailAuth.tsx';
import PhoneAuth from './PhoneAuth.tsx';
import GoogleAuth from './GoogleAuth.tsx';
import { Sprout, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

import { auth } from '../../lib/firebase.ts';
import { signInAnonymously, signInWithCustomToken } from 'firebase/auth';

export default function AuthContainer() {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');

  const { setAppSession } = useAuth();

  const handleQuickDemoLogin = async () => {
    setDemoLoading(true);
    setDemoError('');
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }

      setAppSession(data.token, data.user);
    } catch (err: any) {
      setDemoError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1592982537447-6f2334208035?auto=format&fit=crop&q=80")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-gray-900/40"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-3xl flex items-center justify-center shadow-2xl">
            <Sprout className="h-12 w-12 text-green-400 drop-shadow-md" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
          Agro Vanguard
        </h2>
        <p className="mt-3 text-center text-lg text-gray-200 font-medium drop-shadow">
          Maharashtra Agricultural Digital Twin • Crop Pathology & Vector Defense
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20">
          
          {/* Quick 1-Click Demo Login */}
          <div className="mb-6">
            {demoError && (
              <div className="mb-3 p-2.5 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
                {demoError}
              </div>
            )}
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={demoLoading}
              className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-sm font-bold text-emerald-900 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 border border-emerald-300 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {demoLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-emerald-700" />
              ) : (
                <UserCheck className="h-5 w-5 text-emerald-700" />
              )}
              <span>Instant Farmer Demo Access (1-Click)</span>
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-1.5 font-medium">
              Maharashtra Farmer Profile &amp; Digital Twin (Sanjay Patil - Vidarbha Plot)
            </p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-white text-gray-500 font-semibold tracking-wider">Or Sign In with</span>
            </div>
          </div>

          <GoogleAuth />

          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-white text-gray-400 font-semibold tracking-wider">Mobile OTP / Email</span>
              </div>
            </div>
          </div>

          {/* Method Tabs */}
          <div className="flex space-x-2 mb-6 bg-gray-100/90 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                method === 'phone' 
                  ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              Phone (OTP)
            </button>
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                method === 'email' 
                  ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              Email
            </button>
          </div>

          {method === 'phone' ? <PhoneAuth /> : <EmailAuth />}
          
        </div>
        
        <p className="mt-6 text-center text-xs text-gray-300 font-medium">
          Agro Vanguard &bull; Smart Agriculture Platform for Maharashtra
        </p>
      </div>
    </div>
  );
}
