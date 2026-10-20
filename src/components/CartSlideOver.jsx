import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartSlideOver = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleShopNow = () => {
    onClose();
    navigate('/shop');
  };

  const getProductImage = (item) => {
    if (item.productImageUrl) return item.productImageUrl;
    const nameLower = (item.productName || '').toLowerCase();
    if (nameLower.includes('azania')) return '/images/azania-ppf.jpg';
    if (nameLower.includes('azam')) return '/images/azam-wheat-flour.jpg';
    if (nameLower.includes('kinazi') || nameLower.includes('cassava')) return '/images/kinazi-cassava-flour.jpg';
    if (nameLower.includes('maize') || nameLower.includes('kawunga')) return '/images/maize-flour.jpg';
    return '/images/azania-ppf.jpg';
  };

  const totalAmount = cart?.totalAmount || 0;
  const items = cart?.items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-6 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5.5 w-5.5 text-brand-700" />
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-950">Shopping Cart</h2>
                <p className="text-[11px] text-stone-500 font-medium">Review items & total amounts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto border border-stone-200">
                  <ShoppingBag className="h-8 w-8 text-brand-600 animate-bounce" />
                </div>
                <h3 className="text-base font-semibold text-stone-850">Your cart is empty</h3>
                <p className="text-sm text-stone-400 px-4 leading-relaxed">
                  Explore our premium wheat, maize, and cassava flours and add them to your cart.
                </p>
                <button
                  onClick={handleShopNow}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full shadow-sm cursor-pointer transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const unitPrice = item.productPrice || 0;
                  const itemSubtotal = item.subtotal || unitPrice * item.quantity;
                  const image = getProductImage(item);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl flex gap-3.5 items-start transition-all hover:border-brand-200 hover:bg-white hover:shadow-sm"
                    >
                      {/* Product Picture */}
                      <img
                        src={image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0 bg-white"
                      />

                      <div className="flex-1 space-y-1 text-left">
                        <h4 className="text-sm font-bold text-stone-900 leading-tight">
                          {item.productName}
                        </h4>
                        <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-1.5 font-medium">
                          <span>Weight: {item.productWeight}</span>
                          <span>•</span>
                          <span className="text-stone-700 font-semibold">
                            Unit Price: {unitPrice.toLocaleString()} RWF
                          </span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 text-stone-600 hover:bg-stone-100 rounded transition-colors disabled:opacity-40 cursor-pointer"
                              disabled={item.quantity <= 1 || loading}
                              title="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-stone-600 hover:bg-stone-100 rounded transition-colors disabled:opacity-40 cursor-pointer"
                              disabled={loading}
                              title="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Amount to be Paid for this product */}
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                              Amount to Pay:
                            </span>
                            <span className="text-xs font-extrabold text-brand-850 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 inline-block">
                              {itemSubtotal.toLocaleString()} RWF
                            </span>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            disabled={loading}
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer details */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm text-stone-600">
                  <span>Total Items:</span>
                  <span className="font-semibold text-stone-900">
                    {items.reduce((acc, i) => acc + (i.quantity || 1), 0)} bags
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-bold">
                  <span className="text-stone-800">Grand Total to Pay:</span>
                  <span className="text-2xl font-serif font-extrabold text-brand-900">
                    {totalAmount.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-normal">
                Includes product subtotal amounts. Delivery fee calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={clearCart}
                  className="py-3 border border-stone-250 hover:border-red-200 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-bold rounded-xl transition-all active:scale-98 cursor-pointer"
                  disabled={loading}
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  Checkout Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

