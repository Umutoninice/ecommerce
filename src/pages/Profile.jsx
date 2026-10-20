import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, ShoppingBag, Eye, Calendar, UserCheck, Edit2, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile, authFetch } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await authFetch('/api/orders');
        // Back-end returns order items. Sort by createdAt desc
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaveSuccess(false);
    setSaving(true);
    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile information.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-stone-900">My Account Dashboard</h1>
        <p className="text-sm text-stone-500">
          Manage your personal details and view your baking staples purchase history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 bg-white p-6 border border-stone-200 rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-650" />
              Account Details
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-stone-400 hover:text-brand-600 p-1.5 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Details"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5" />
              Profile updated successfully!
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-750 rounded-xl text-xs">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                  className="flex-1 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xl uppercase">
                  {user.firstName[0] + user.lastName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <span className="text-xs bg-brand-50 border border-brand-200 text-brand-700 px-2 py-0.5 rounded font-semibold inline-block capitalize mt-1">
                    {user.roles?.[0]?.replace('ROLE_', '').toLowerCase()} Account
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 pt-4 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-semibold leading-none">Email Address</p>
                    <p className="text-stone-800 font-semibold mt-1">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-stone-400" />
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-semibold leading-none">Phone Contact</p>
                    <p className="text-stone-800 font-semibold mt-1">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-8 bg-white p-6 border border-stone-200 rounded-3xl space-y-6">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShoppingBag className="h-5 w-5 text-brand-650" />
            Order History & Statuses
          </h2>

          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 w-full bg-stone-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="h-16 w-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800">No orders placed yet</h3>
              <p className="text-sm text-stone-400 max-w-xs mx-auto">
                All order purchases, shipments, and Mobile Money receipts will appear in this timeline.
              </p>
              <Link
                to="/shop"
                className="inline-block px-5 py-2.5 bg-brand-650 hover:bg-brand-700 text-white text-xs font-semibold rounded-full shadow"
              >
                Go to Shop
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-150 text-stone-400 uppercase tracking-wider text-left font-bold bg-stone-50 rounded-xl">
                    <th className="py-3 px-4">Order Code</th>
                    <th className="py-3 px-4">Date Placed</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900">{o.orderNumber}</td>
                      <td className="py-3.5 px-4 text-stone-500 font-medium">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-900">{o.totalAmount?.toLocaleString()} RWF</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : o.status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : o.status === 'PAID'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : o.status === 'FAILED'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-250 animate-pulse'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/order/${o.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-250 text-stone-600 rounded-lg font-semibold transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
