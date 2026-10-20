import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminReports } from './AdminReports';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { BarChart3, Package, Layers, ClipboardList, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export const AdminDashboard = () => {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');

  // Security check: Redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-stone-500">
        <span className="animate-spin mr-2 h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full"></span>
        Loading Administrator Panel...
      </div>
    );
  }

  const menuItems = [
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products Inventory', icon: Package },
    { id: 'categories', label: 'Flour Categories', icon: Layers },
    { id: 'orders', label: 'Orders & Logistics', icon: ClipboardList },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-stone-50/50">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 md:min-h-full flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <ShieldAlert className="h-6 w-6 text-brand-650 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-stone-900 leading-tight">Admin Dashboard</h2>
              <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Role: System Admin</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-100'
                      : 'text-stone-605 hover:bg-stone-50 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-stone-100 space-y-2 font-semibold text-xs text-stone-600">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-stone-400" />
            Back to Shop
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-red-400" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-6 md:p-8 bg-stone-50 overflow-y-auto">
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'orders' && <AdminOrders />}
      </main>
    </div>
  );
};
