import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wheat, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res?.message || 'Password reset details have been logged to the console simulator.');
    } catch (err) {
      setError(err.message || 'An error occurred triggering password recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-brand-50/20">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6 text-left">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 justify-center">
            <Wheat className="h-8 w-8 text-brand-600" />
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-900">
              Flour<span className="text-brand-500 font-sans font-light">.rw</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-stone-900">Reset Your Password</h2>
          <p className="text-xs text-stone-450 leading-relaxed max-w-sm mx-auto">
            Enter your email and we'll simulate sending a password reset token.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-850 rounded-2xl text-xs space-y-3 leading-relaxed">
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle className="h-4.5 w-4.5" />
              Reset Token Generated!
            </div>
            <p>{successMsg}</p>
            <div className="pt-2 border-t border-emerald-100 flex justify-between items-center text-[10px]">
              <span className="text-stone-400">Check spring boot server logs for token details.</span>
              <Link to="/reset-password" className="text-brand-650 font-bold hover:underline">
                Go to Reset Form
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@flour.rw"
                  className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow shadow-brand-100 flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-4 flex justify-between items-center">
          <Link to="/login" className="text-brand-650 font-bold hover:underline">
            Back to Login
          </Link>
          <Link to="/reset-password" className="text-stone-450 hover:underline">
            Has a reset token?
          </Link>
        </div>
      </div>
    </div>
  );
};
