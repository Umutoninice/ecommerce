import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Eye, Calendar, Clock, Edit2, AlertCircle, X, Check } from 'lucide-react';

export const AdminOrders = () => {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active details modal
  const [activeOrder, setActiveOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Form states for status edits
  const [orderStatus, setOrderStatus] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [estDate, setEstDate] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await authFetch('/api/orders');
      // Sort desc by date
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = (o) => {
    setActiveOrder(o);
    setOrderStatus(o.status || '');
    setDeliveryStatus(o.delivery?.status || '');
    setEstDate(o.delivery?.estimatedDeliveryDate || '');
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setSavingStatus(true);
    try {
      // 1. Update Order Status
      if (orderStatus !== activeOrder.status) {
        await authFetch(`/api/orders/${activeOrder.id}/status?status=${orderStatus}`, {
          method: 'PUT',
        });
      }

      // 2. Update Delivery Status if active
      if (activeOrder.delivery && (deliveryStatus !== activeOrder.delivery.status || estDate !== activeOrder.delivery.estimatedDeliveryDate)) {
        let url = `/api/deliveries/${activeOrder.delivery.id}/status?status=${deliveryStatus}`;
        if (estDate) {
          url += `&estimatedDate=${estDate}`;
        }
        await authFetch(url, {
          method: 'PUT',
        });
      }

      setDetailsOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order statuses.');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Order & Logistics Manager</h1>
        <p className="text-xs text-stone-500">Track purchase transactions, update shipping logs, and schedule dispatch dates.</p>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-10 w-full bg-stone-100 rounded-lg"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-xs text-stone-450 space-y-2">
            <ShoppingBag className="h-10 w-10 text-stone-300 mx-auto" />
            <p>No orders registered in the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-150 text-stone-455 text-stone-450 uppercase font-bold text-left bg-stone-50 tracking-wider">
                  <th className="py-3.5 px-4">Order Code</th>
                  <th className="py-3.5 px-4">Date Placed</th>
                  <th className="py-3.5 px-4">Recipient Name</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-stone-505 text-stone-500 font-medium">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-stone-605 text-stone-700 font-bold">
                      {o.delivery?.recipientName || '-'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-brand-900">
                      {o.totalAmount?.toLocaleString()} RWF
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                            : o.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-100'
                            : o.status === 'PAID'
                            ? 'bg-indigo-50 text-indigo-805 text-indigo-800 border border-indigo-150'
                            : o.status === 'FAILED'
                            ? 'bg-red-50 text-red-800 border border-red-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-250 animate-pulse'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {o.delivery ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            o.delivery.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : o.delivery.status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {o.delivery.status}
                        </span>
                      ) : (
                        <span className="text-stone-400 font-normal">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewDetails(o)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-50 hover:bg-stone-105 hover:bg-stone-100 border border-stone-250 text-stone-600 hover:text-stone-900 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Manager Slide-Over Panel */}
      {detailsOpen && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setDetailsOpen(false)}></div>
          
          <div className="w-screen max-w-lg transform bg-white shadow-2xl z-10 flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-6 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 font-bold">ORDER DETAILS</span>
                <h2 className="text-base font-serif font-bold text-stone-950 mt-0.5">
                  Order Code: {activeOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contents */}
            <div className="flex-1 p-5 space-y-6 text-xs text-stone-600 font-semibold">
              {/* Order Items Summary */}
              <div className="bg-stone-50 p-4 border border-stone-150 rounded-2xl space-y-3.5">
                <h3 className="font-bold text-stone-900 border-b border-stone-200 pb-1 text-sm">
                  Purchased Items
                </h3>
                <div className="space-y-3">
                  {activeOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-baseline font-semibold">
                      <div>
                        <p className="text-stone-900 font-bold">{item.productName}</p>
                        <p className="text-stone-400 text-[10px] mt-0.5">Qty: {item.quantity} | {item.priceAtPurchase?.toLocaleString()} RWF</p>
                      </div>
                      <span className="text-brand-900 font-extrabold shrink-0 text-sm">
                        {(item.subtotal || (item.priceAtPurchase * item.quantity)).toLocaleString()} RWF
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-stone-700">Total Bill Amount</span>
                  <span className="text-brand-950 font-serif font-extrabold text-base">
                    {activeOrder.totalAmount?.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-6">
                <h3 className="font-bold text-stone-900 border-b border-stone-150 pb-1 text-sm">
                  Update Logistics Status
                </h3>

                <div className="space-y-4">
                  {/* Order Status Select */}
                  <div className="space-y-1">
                    <label className="text-stone-605 block">Order Payment/Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-205 border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850 cursor-pointer"
                    >
                      <option value="PENDING">PENDING (Awaiting payment)</option>
                      <option value="PAID">PAID (Success Callback)</option>
                      <option value="SHIPPED">SHIPPED (En route)</option>
                      <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                      <option value="FAILED">FAILED (Transaction failure)</option>
                    </select>
                  </div>

                  {/* Delivery Status Select */}
                  {activeOrder.delivery && (
                    <>
                      <div className="space-y-1">
                        <label className="text-stone-605 block">Delivery Dispatch Status</label>
                        <select
                          value={deliveryStatus}
                          onChange={(e) => setDeliveryStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-205 border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      {/* Estimated Delivery Date input */}
                      <div className="space-y-1">
                        <label className="text-stone-605 block">Estimated Delivery Date</label>
                        <input
                          type="date"
                          value={estDate}
                          onChange={(e) => setEstDate(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-205 border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Shipping Details info logs */}
                {activeOrder.delivery && (
                  <div className="bg-stone-50 p-4 border border-stone-150 rounded-2xl space-y-2.5 text-[11px] leading-relaxed">
                    <p className="font-bold text-stone-900 border-b border-stone-200 pb-1 text-xs">Recipient Logistics Info</p>
                    <p><span className="text-stone-400 font-semibold uppercase">Client Name:</span> {activeOrder.delivery.recipientName}</p>
                    <p><span className="text-stone-400 font-semibold uppercase">Client Phone:</span> {activeOrder.delivery.recipientPhone}</p>
                    <p><span className="text-stone-400 font-semibold uppercase">Logistics Address:</span> {activeOrder.delivery.addressLine1}, {activeOrder.delivery.city}, {activeOrder.delivery.province}</p>
                    <p><span className="text-stone-400 font-semibold uppercase">Tracking Number:</span> {activeOrder.delivery.trackingNumber}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 font-semibold">
                  <button
                    type="button"
                    onClick={() => setDetailsOpen(false)}
                    className="px-5 py-2.5 border border-stone-250 hover:bg-stone-50 rounded-xl cursor-pointer"
                    disabled={savingStatus}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-650 hover:bg-brand-700 text-white rounded-xl cursor-pointer flex items-center gap-1.5"
                    disabled={savingStatus}
                  >
                    <Check className="h-4.5 w-4.5" />
                    {savingStatus ? 'Updating...' : 'Save Logistics Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
