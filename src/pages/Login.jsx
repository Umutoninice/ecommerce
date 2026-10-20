import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wheat, Mail, Lock, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // If redirect param is set, navigate there, else go home
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-brand-50/20">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6 text-left">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 justify-center">
            <Wheat className="h-8 w-8 text-brand-600" />
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-900">
              Flour<span className="text-brand-500 font-sans font-light">.rw</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-stone-900">Sign In to Your Account</h2>
          <p className="text-xs text-stone-450">
            Welcome back! Enter your details to continue.
          </p>
        </div>

        {/* Errors */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-600">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-650 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Navigation Register */}
        <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-4">
          Don't have an account?{' '}
          <Link
            to={redirect ? `/register?redirect=${redirect}` : '/register'}
            className="text-brand-650 font-bold hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
