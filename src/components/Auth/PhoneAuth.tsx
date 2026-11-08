import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Phone, Loader2, KeyRound, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStepVerify, setIsStepVerify] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState('');
  const { setAppSession } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    setLoading(true);

    const formattedPhone = phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;

    // Simulate sending OTP
    setTimeout(() => {
      setIsStepVerify(true);
      setSuggestedCode('123456');
      setVerificationCode('123456');
      setSuccessNotice(`OTP sent to ${formattedPhone}. Enter code 123456 to verify.`);
      setLoading(false);
    }, 800);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (verificationCode.trim() !== '123456') {
      setError('Invalid verification code. Please check and try again.');
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;
      
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setAppSession(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      {successNotice && (
        <div className="p-3 text-sm text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {!isStepVerify ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile / Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="+91 9876543210"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter 10-digit number or with country code (e.g., +91 for India)</p>
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms-phone"
                type="checkbox"
                required
                defaultChecked
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
            </div>
            <div className="ml-2 text-sm">
              <label htmlFor="terms-phone" className="font-medium text-gray-700">
                I agree to the <a href="#" className="text-green-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verifying {phoneNumber}</span>
            </div>
            {suggestedCode && (
              <button
                type="button"
                onClick={() => setVerificationCode(suggestedCode)}
                className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                Auto-fill {suggestedCode}
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code (6 Digits)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 text-xl tracking-widest font-mono text-center"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Verify & Sign In</span>
              </>
            )}
          </button>
          
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsStepVerify(false);
                setVerificationCode('');
                setError('');
                setSuccessNotice('');
              }}
              className="hover:text-green-700 underline"
            >
              Change Phone Number
            </button>
            <button
              type="button"
              onClick={(e) => handleSendCode(e)}
              className="hover:text-green-700 underline"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
