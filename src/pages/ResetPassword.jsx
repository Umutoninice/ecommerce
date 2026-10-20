import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wheat, Key, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [tokenVal, setTokenVal] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!tokenVal || !newPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(tokenVal, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Check if the token is correct or expired.');
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
          <h2 className="text-xl font-bold text-stone-900">Create New Password</h2>
          <p className="text-xs text-stone-450 leading-relaxed max-w-sm mx-auto">
            Input the simulation reset token received in the server logs and configure your new password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl text-xs font-semibold text-center leading-normal">
            Password reset successful! Redirecting to sign in screen...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Reset Token</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tokenVal}
                  onChange={(e) => setTokenVal(e.target.value)}
                  placeholder="Paste token here..."
                  className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
                <Key className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow shadow-brand-100 flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-4 flex justify-between items-center">
          <Link to="/login" className="text-brand-650 font-bold hover:underline">
            Back to Login
          </Link>
          <Link to="/forgot-password" className="text-stone-450 hover:underline">
            Request new token
          </Link>
        </div>
      </div>
    </div>
  );
};
