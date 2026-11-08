import React, { useState, useRef } from 'react';
import { auth } from '../../lib/firebase.ts';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function GoogleAuth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const isSigningInRef = useRef(false);

  const handleGoogleSignIn = async () => {
    // Prevent concurrent executions from double-clicks that trigger internal SDK assertion errors
    if (isSigningInRef.current) {
      return;
    }

    isSigningInRef.current = true;
    setError('');
    setPopupBlocked(false);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // signInWithPopup initiates the Google OAuth popup
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked')) {
        console.warn('Google Auth popup was blocked by browser popup blocker in preview iframe.');
        setPopupBlocked(true);
        setError('Your browser blocked the Google sign-in popup.');
      } else if (errorCode === 'auth/popup-closed-by-user' || errorMessage.includes('popup-closed-by-user')) {
        console.info('Google sign-in popup was closed by user.');
        setError('Sign-in cancelled. The popup window was closed before completion.');
      } else if (errorCode === 'auth/cancelled-popup-request' || errorMessage.includes('cancelled-popup-request')) {
        console.info('A previous sign-in popup was cancelled.');
        setError('Sign-in cancelled. Please try again.');
      } else if (errorMessage.includes('Pending promise was never set')) {
        // Internal Firebase Auth event-handler artifact when a popup closes rapidly
        console.warn('Firebase Auth popup event cleanup notification.');
        setError('Sign-in window closed. Click "Continue with Google" to try again.');
      } else {
        console.warn('Google Auth error:', errorMessage);
        setError(errorMessage || 'Google authentication failed. Please try again or use the Instant Demo login.');
      }
    } finally {
      isSigningInRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {popupBlocked && (
        <div className="p-3 text-xs bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">Popup Blocked by Browser</p>
              <p className="text-amber-800 mt-0.5">
                The preview runs inside an iframe, so browsers often block sign-in popups by default.
              </p>
            </div>
          </div>
          <div className="bg-white/80 p-2 rounded-lg border border-amber-100 text-[11px] text-amber-800 space-y-1">
            <p><strong>To sign in with Google:</strong> Click the popup blocker icon in your browser URL bar and choose <em>"Always allow popups"</em>.</p>
            <p><strong>Or instant test:</strong> Use the <strong>"Instant Farmer Demo Access (1-Click)"</strong> button above or Mobile OTP below.</p>
          </div>
        </div>
      )}

      {error && !popupBlocked && (
        <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
      >
        {loading ? (
          <RefreshCw className="animate-spin h-5 w-5 text-gray-500" />
        ) : (
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5" 
          />
        )}
        <span>{loading ? 'Opening Google Sign-In...' : 'Continue with Google'}</span>
      </button>
    </div>
  );
}

