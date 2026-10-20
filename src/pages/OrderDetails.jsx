import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Circle, Clock, MapPin, Phone, User, Landmark, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export const OrderDetails = () => {
  const { id } = useParams();
  const { authFetch } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const data = await authFetch(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const simulatePayment = async (status) => {
    if (!order || !order.payment) return;
    setSimulating(true);
    setSimResult('');
    try {
      // MTN Momo Webhook Simulation call
      const res = await fetch('/api/payments/momo-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionReference: order.payment.transactionReference,
          status: status, // PAID or FAILED
        }),
      });

      if (!res.ok) {
        throw new Error('Simulation failed');
      }

      const data = await res.json();
      setSimResult(`Payment simulated as ${status}. Status: ${data.message}`);
      
      // Reload order details after a brief delay
      setTimeout(() => {
        fetchOrderDetails();
        setSimResult('');
      }, 1500);
    } catch (err) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="h-6 w-32 bg-stone-250 bg-stone-200 rounded mx-auto"></div>
        <div className="h-40 w-full bg-stone-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-stone-800">Failed to load order</h3>
        <p className="text-sm text-stone-500">{error || 'Order not found.'}</p>
        <Link
          to="/profile"
          className="inline-block px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const { orderNumber, totalAmount, status, orderItems, payment, delivery, createdAt } = order;

  // Tracking Steps
  const steps = [
    { label: 'Order Placed', status: 'COMPLETED' },
    { label: 'Payment Completed', status: status !== 'PENDING' && status !== 'FAILED' ? 'COMPLETED' : 'PENDING' },
    { label: 'Shipped', status: status === 'SHIPPED' || status === 'DELIVERED' ? 'COMPLETED' : 'PENDING' },
    { label: 'Delivered', status: status === 'DELIVERED' ? 'COMPLETED' : 'PENDING' },
  ];

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold text-stone-400">Order ID: #{id}</span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-950 mt-1">
            Order <span className="font-sans font-medium text-stone-600">{orderNumber}</span>
          </h1>
          <p className="text-xs text-stone-450 mt-1">
            Placed on: {new Date(createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrderDetails}
            className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className="h-4.5 w-4.5 text-stone-500" />
          </button>
          
          <span
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm ${
              status === 'DELIVERED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : status === 'SHIPPED'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : status === 'PAID'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-850'
                : status === 'FAILED'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-amber-50 border-amber-250 text-amber-800 animate-pulse'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white p-6 md:p-8 border border-stone-200 rounded-3xl space-y-6">
        <h3 className="text-sm font-bold text-stone-900 block">Delivery Tracking</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2.5 text-left sm:text-center">
              {step.status === 'COMPLETED' ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-8 w-8 text-stone-300 shrink-0" />
              )}
              <div>
                <p className={`text-sm font-bold ${step.status === 'COMPLETED' ? 'text-stone-900' : 'text-stone-400'}`}>
                  {step.label}
                </p>
                {idx === 1 && status === 'PENDING' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold mt-1 inline-block animate-pulse">
                    Awaiting MoMo Prompt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Items & Delivery details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Order items receipt */}
          <div className="bg-white p-6 border border-stone-200 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              Purchased Items
            </h3>
            <div className="divide-y divide-stone-100">
              {orderItems.map((item) => {
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

                const unitPrice = item.priceAtPurchase || 0;
                const itemSubtotal = item.subtotal || unitPrice * item.quantity;

                return (
                  <div key={item.id} className="py-3.5 flex items-center gap-3.5 first:pt-0 last:pb-0">
                    <img
                      src={image}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-xl border border-stone-200 bg-stone-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-stone-900 text-xs font-bold truncate">{item.productName}</h4>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Quantity: {item.quantity} bag(s) × {unitPrice.toLocaleString()} RWF
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-stone-400 font-bold uppercase block">
                        Amount Paid:
                      </span>
                      <span className="text-xs font-extrabold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {itemSubtotal.toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-stone-150 flex justify-between items-baseline">
              <span className="text-stone-500 text-sm font-semibold">Total Paid Amount:</span>
              <span className="text-xl font-serif font-extrabold text-brand-900">
                {totalAmount?.toLocaleString()} RWF
              </span>
            </div>
          </div>

          {/* Delivery & Shipping Info */}
          {delivery && (
            <div className="bg-white p-6 border border-stone-200 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
                Shipping Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <User className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <p className="text-stone-400 font-medium">Recipient Name</p>
                      <p className="font-bold text-stone-900 mt-0.5">{delivery.recipientName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Phone className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <p className="text-stone-400 font-medium">Contact Phone</p>
                      <p className="font-bold text-stone-900 mt-0.5">{delivery.recipientPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <MapPin className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <p className="text-stone-400 font-medium">Destination Address</p>
                      <p className="font-bold text-stone-900 mt-0.5">
                        {delivery.addressLine1}, {delivery.city}, {delivery.province}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Clock className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <p className="text-stone-400 font-medium">Estimated Delivery Date</p>
                      <p className="font-bold text-stone-900 mt-0.5">
                        {delivery.estimatedDeliveryDate
                          ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString()
                          : 'Awaiting scheduling'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-stone-450">Tracking Number:</span>
                <span className="font-mono font-bold text-stone-800 bg-stone-50 px-2 py-1 border border-stone-150 rounded">
                  {delivery.trackingNumber}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mobile Money Webhook Simulator */}
        <div className="lg:col-span-5 space-y-8">
          {/* Payment info summary */}
          {payment && (
            <div className="bg-white p-6 border border-stone-200 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
                Payment Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Payment Gateway</span>
                  <span className="font-bold text-stone-900">{payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Transaction ID</span>
                  <span className="font-mono font-bold text-stone-705 text-stone-700">{payment.transactionReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Payment Status</span>
                  <span
                    className={`font-bold capitalize ${
                      payment.status === 'PAID'
                        ? 'text-emerald-700'
                        : payment.status === 'FAILED'
                        ? 'text-red-700'
                        : 'text-amber-700 animate-pulse'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Webhook Simulator Panel */}
          {status === 'PENDING' && payment && (
            <div className="bg-brand-50/50 p-6 border border-brand-200 rounded-3xl space-y-4 shadow-sm">
              <div className="flex gap-2">
                <AlertTriangle className="h-5.5 w-5.5 text-brand-650 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">MTN MoMo/Airtel Callback Simulator</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-normal">
                    This staging environment simulates provider payment notifications by sending webhooks to the Spring Boot callback listener.
                  </p>
                </div>
              </div>

              {simResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl text-xs font-semibold text-center leading-normal animate-pulse">
                  {simResult}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="text-[10px] text-stone-450 space-y-1">
                  <p className="font-bold">TARGET WEBHOOK URI:</p>
                  <p className="font-mono bg-white p-2 border border-brand-100 rounded break-all">
                    POST /api/payments/momo-callback
                  </p>
                  <p className="font-bold pt-1">PAYLOAD:</p>
                  <pre className="bg-white p-2 border border-brand-105 rounded font-mono text-[9px]">
{JSON.stringify(
  {
    transactionReference: payment.transactionReference,
    status: 'PAID',
  },
  null,
  2
)}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => simulatePayment('PAID')}
                    disabled={simulating}
                    className="py-2.5 bg-emerald-650 hover:bg-emerald-705 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Simulate Success
                  </button>
                  <button
                    onClick={() => simulatePayment('FAILED')}
                    disabled={simulating}
                    className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Simulate Failure
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
