import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, ShoppingBag, PackageOpen, AlertTriangle, Star, ShieldAlert } from 'lucide-react';

export const AdminReports = () => {
  const { authFetch } = useAuth();
  const [salesReport, setSalesReport] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [customersReport, setCustomersReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [sales, best, customers, inventory] = await Promise.all([
          authFetch('/api/reports/sales'),
          authFetch('/api/reports/best-sellers'),
          authFetch('/api/reports/customers'),
          authFetch('/api/reports/inventory'),
        ]);

        setSalesReport(sales);
        setBestSellers(best || []);
        setCustomersReport(customers || []);
        setInventoryReport(inventory);
      } catch (err) {
        console.error('Error fetching admin reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-stone-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-stone-200 rounded-3xl"></div>
      </div>
    );
  }

  // Calculate chart parameters if data is present
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesByMonth = salesReport?.salesByMonth || [];
  
  // Format for chart: sort/filter to have reasonable monthly bars
  const chartData = salesByMonth.map((s) => ({
    label: `${months[(s.month - 1) % 12]} ${s.year}`,
    amount: s.amount,
  }));

  const maxAmount = chartData.reduce((max, d) => Math.max(max, d.amount), 100000) || 100000;

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Business Intelligence Reports</h1>
        <p className="text-xs text-stone-500">Real-time overview of sales revenue, inventories levels, and top client orders.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 border border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Total Sales</span>
            <p className="text-xl font-extrabold text-brand-900">
              {(salesReport?.totalSales || 0).toLocaleString()} RWF
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Completed Orders</span>
            <p className="text-xl font-extrabold text-stone-900">
              {salesReport?.successfulOrdersCount || 0} Orders
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
            <ShoppingBag className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Avg Order Value</span>
            <p className="text-xl font-extrabold text-stone-900">
              {Math.round(salesReport?.averageOrderValue || 0).toLocaleString()} RWF
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Star className="h-5.5 w-5.5 text-emerald-500 fill-emerald-50" />
          </div>
        </div>

        <div className="bg-white p-5 border border-stone-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Low Stock Products</span>
            <p className="text-xl font-extrabold text-red-655 text-red-700">
              {inventoryReport?.lowStockProductsCount || 0} Items
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* SVG Chart Panel */}
      <div className="bg-white p-6 border border-stone-200 rounded-3xl space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900">Sales Trend by Month</h3>
        {chartData.length === 0 ? (
          <div className="h-56 bg-stone-50 rounded-xl flex items-center justify-center text-xs text-stone-400 border border-stone-150">
            No sales records available yet.
          </div>
        ) : (
          <div className="relative pt-2">
            <svg className="w-full h-64 overflow-visible" viewBox="0 0 600 240">
              {/* Y Axis Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 200 - ratio * 160;
                const value = Math.round(maxAmount * ratio);
                return (
                  <g key={idx} className="opacity-40">
                    <line x1="50" y1={y} x2="560" y2={y} stroke="#e5e4e7" strokeDasharray="4 4" strokeWidth="1" />
                    <text x="10" y={y + 4} className="text-[10px] font-semibold text-stone-400" textAnchor="start">
                      {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((d, idx) => {
                const barWidth = 40;
                const gap = (500 - chartData.length * barWidth) / (chartData.length + 1);
                const x = 50 + gap + idx * (barWidth + gap);
                const barHeight = d.amount > 0 ? (d.amount / maxAmount) * 160 : 4;
                const y = 200 - barHeight;

                return (
                  <g key={idx} className="group cursor-pointer">
                    {/* Hover tooltip hint */}
                    <title>{`${d.label}: ${d.amount.toLocaleString()} RWF`}</title>
                    {/* Gradient Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      className="fill-brand-500 hover:fill-brand-600 transition-colors duration-200"
                    />
                    {/* Text Label */}
                    <text x={x + barWidth / 2} y="220" className="text-[10px] font-bold text-stone-500" textAnchor="middle">
                      {d.label}
                    </text>
                  </g>
                );
              })}
              {/* Base line */}
              <line x1="50" y1="200" x2="560" y2="200" stroke="#b45309" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-white p-5 border border-stone-200 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
            Top Selling Flour Types
          </h3>
          {bestSellers.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No purchases recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-5 bg-brand-50 border border-brand-200 text-brand-700 font-bold rounded flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-stone-905 text-stone-900 font-bold leading-tight">{item.productName}</p>
                      <p className="text-stone-400 mt-0.5">{item.brand} | {item.weight}</p>
                    </div>
                  </div>
                  <span className="text-stone-700 bg-stone-50 px-2 py-1 rounded border border-stone-150">
                    {item.quantitySold} Bags Sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 border border-stone-200 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-red-505 text-red-650" />
            Inventory Low Stock Warning
          </h3>
          {!inventoryReport || !inventoryReport.lowStockProducts || inventoryReport.lowStockProducts.length === 0 ? (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-4 border border-emerald-100 rounded-xl text-center">
              All warehouse stocks are within safe levels.
            </p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {inventoryReport.lowStockProducts.map((p) => (
                <div key={p.productId} className="p-3 bg-red-50/40 border border-red-100 rounded-xl flex items-start justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900 leading-tight">{p.productName}</h4>
                    <p className="text-stone-405 text-stone-500 mt-1">Loc: {p.warehouseLocation || 'Main Hub'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-red-105 bg-red-100 text-red-750 rounded font-extrabold">
                      {p.stockQuantity} bags left
                    </span>
                    <p className="text-[10px] text-stone-400 mt-1">Threshold: {p.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Purchase Report */}
      <div className="bg-white p-5 border border-stone-200 rounded-3xl space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
          Customer Purchase Reports
        </h3>
        {customersReport.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">No customer orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="text-left font-bold text-stone-400 border-b border-stone-150 uppercase tracking-wider bg-stone-50">
                  <th className="py-2.5 px-4">Client Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Orders Placed</th>
                  <th className="py-2.5 px-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customersReport.map((c) => (
                  <tr key={c.customerId} className="hover:bg-stone-55 hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-bold text-stone-900">{c.customerName}</td>
                    <td className="py-3 px-4 text-stone-500 font-medium">{c.email}</td>
                    <td className="py-3 px-4 font-bold text-stone-700">{c.totalOrders} Orders</td>
                    <td className="py-3 px-4 text-right font-extrabold text-brand-900">
                      {c.totalSpent?.toLocaleString()} RWF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
