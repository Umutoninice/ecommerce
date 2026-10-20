import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wheat, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { email, password, firstName, lastName, phoneNumber } = formData;

    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(redirect ? `/login?redirect=${redirect}` : '/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Registration failed. Try using a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-brand-50/20">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6 text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 justify-center">
            <Wheat className="h-8 w-8 text-brand-600" />
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-900">
              Flour<span className="text-brand-500 font-sans font-light">.rw</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-stone-900">Create a New Account</h2>
          <p className="text-xs text-stone-450">
            Join us to purchase high-quality local grains.
          </p>
        </div>

        {/* Errors & Success */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl text-xs font-semibold text-center leading-normal">
            Registration successful! Redirecting to login screen...
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">First Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">Last Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Mugisha"
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@flour.rw"
                  className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Phone Number (Optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+250 781 234 567"
                  className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
                <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password..."
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
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-4">
          Already have an account?{' '}
          <Link
            to={redirect ? `/login?redirect=${redirect}` : '/login'}
            className="text-brand-650 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
