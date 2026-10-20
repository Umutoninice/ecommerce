import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, CreditCard, MapPin, Phone, User, AlertCircle } from 'lucide-react';

export const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    addressLine1: '',
    city: '',
    province: 'Kigali',
    paymentMethod: 'MTN_MOMO',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill user details if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        recipientName: `${user.firstName} ${user.lastName}`,
        recipientPhone: user.phoneNumber || '',
      }));
    }
  }, [user]);

  // Block checkout if cart is empty
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-16 w-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-stone-800">Your cart is empty</h3>
        <p className="text-sm text-stone-500">
          Add some products to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full cursor-pointer"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone validation warning
    if (!formData.recipientPhone.startsWith('+250') && !formData.recipientPhone.startsWith('07')) {
      setError('Please provide a valid Rwandan phone number starting with +250 or 07.');
      return;
    }

    setLoading(true);
    try {
      const createdOrder = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Clear the local cart
      await clearCart();

      // Redirect to tracking page
      navigate(`/order/${createdOrder.id}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please review your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-stone-900 font-bold">Checkout Shipping & Payment</h1>
        <p className="text-sm text-stone-500">
          Provide delivery details and select your payment method.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-750 rounded-xl flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-stone-200 rounded-3xl space-y-6">
          <h2 className="text-lg font-serif font-bold text-stone-950 flex items-center gap-2 pb-3 border-b border-stone-100">
            <MapPin className="h-5 w-5 text-brand-650" />
            1. Delivery Address
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">Recipient Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="recipientName"
                    required
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Jean Mugisha"
                    className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">Recipient Phone Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="recipientPhone"
                    required
                    value={formData.recipientPhone}
                    onChange={handleChange}
                    placeholder="+250 781 234 567"
                    className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                    disabled={loading}
                  />
                  <Phone className="absolute left-3 top-3.5 h-4.5 w-4.5 text-stone-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Street / Delivery Address *</label>
              <div className="relative">
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="KG 123 St, Gikondo"
                  className="w-full pl-9.5 pr-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
                <MapPin className="absolute left-3 top-3.5 h-4.5 w-4.5 text-stone-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Kigali"
                  className="w-full px-4 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 block">Province *</label>
                <select
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50 cursor-pointer"
                  disabled={loading}
                >
                  <option value="Kigali">Kigali</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Western">Western</option>
                  <option value="Northern">Northern</option>
                  <option value="Southern">Southern</option>
                </select>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-serif font-bold text-stone-950 flex items-center gap-2 pb-3 border-b border-stone-100 pt-4">
            <CreditCard className="h-5 w-5 text-brand-650" />
            2. Payment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'MTN_MOMO', name: 'MTN MoMo', logo: 'MTN Mobile Money' },
              { id: 'AIRTEL_MONEY', name: 'Airtel Money', logo: 'Airtel Money' },
              { id: 'BANK_TRANSFER', name: 'Bank Transfer', logo: 'Direct Bank' },
            ].map((method) => (
              <label
                key={method.id}
                className={`p-4 rounded-xl border flex flex-col justify-between items-start gap-4 transition-all cursor-pointer select-none ${
                  formData.paymentMethod === method.id
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-1 ring-brand-600'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={formData.paymentMethod === method.id}
                  onChange={handleChange}
                  className="accent-brand-600 cursor-pointer h-4 w-4"
                  disabled={loading}
                />
                <div>
                  <p className="text-sm font-bold text-stone-900 leading-none">{method.name}</p>
                  <p className="text-[10px] text-stone-400 mt-1">{method.logo}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-5 bg-stone-50 p-6 md:p-8 border border-stone-200 rounded-3xl space-y-6">
          <h2 className="text-lg font-serif font-bold text-stone-950 flex items-center gap-2 pb-3 border-b border-stone-200">
            <ShoppingBag className="h-5 w-5 text-brand-650" />
            Order Summary
          </h2>

          <div className="divide-y divide-stone-200 max-h-80 overflow-y-auto pr-1">
            {cart.items.map((item) => {
              const image =
                item.productImageUrl ||
                (item.productName?.toLowerCase().includes('azania')
                  ? '/images/azania-ppf.jpg'
                  : item.productName?.toLowerCase().includes('azam')
                  ? '/images/azam-wheat-flour.jpg'
                  : item.productName?.toLowerCase().includes('kinazi') || item.productName?.toLowerCase().includes('cassava')
                  ? '/images/kinazi-cassava-flour.jpg'
                  : item.productName?.toLowerCase().includes('maize') || item.productName?.toLowerCase().includes('kawunga')
                  ? '/images/maize-flour.jpg'
                  : '/images/azania-ppf.jpg');

              const unitPrice = item.productPrice || 0;
              const subtotal = item.subtotal || unitPrice * item.quantity;

              return (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={image}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-xl border border-stone-200 bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 leading-tight truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.quantity} bag(s) × {unitPrice.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-stone-400 font-bold uppercase block">
                      Amount to Pay:
                    </span>
                    <span className="text-xs font-extrabold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {subtotal.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-stone-200 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Cart Subtotal</span>
              <span className="text-stone-850 font-bold">{cart.totalAmount?.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between items-center text-xs text-stone-450">
              <span>Local Delivery Fee</span>
              <span>FREE</span>
            </div>
            <div className="h-px bg-stone-200 my-2"></div>
            <div className="flex justify-between items-center text-base font-bold">
              <span className="text-stone-800">Total Amount</span>
              <span className="text-xl font-serif text-brand-900">{cart.totalAmount?.toLocaleString()} RWF</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-brand-100 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};
