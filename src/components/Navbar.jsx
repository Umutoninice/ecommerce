import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Wheat, ShoppingBag, User, LogOut, LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar = ({ onCartToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-40 w-full border-b border-brand-100 shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 transition-transform active:scale-95">
            <Wheat className="h-8 w-8 text-brand-600 animate-pulse" />
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-900">
              Flour<span className="text-brand-500 font-sans font-light">.rw</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-stone-700 hover:text-brand-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-stone-700 hover:text-brand-600 font-medium transition-colors">
              Shop Flour
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 rounded-full text-sm font-semibold transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* User & Cart controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={onCartToggle}
              className="relative p-2.5 text-stone-700 hover:text-brand-600 hover:bg-stone-50 rounded-full transition-all active:scale-95 cursor-pointer"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.firstName ? user.firstName[0] + user.lastName[0] : 'U'}
                  </div>
                  <span className="text-sm max-w-[120px] truncate">
                    {user.firstName}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-40 animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-stone-100 mb-1">
                        <p className="text-xs text-stone-400">Signed in as</p>
                        <p className="text-sm font-semibold text-stone-800 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile & Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Settings
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-stone-700 hover:text-brand-600 font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold text-sm transition-all shadow-sm shadow-brand-200 hover:shadow active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onCartToggle}
              className="relative p-2 text-stone-700 hover:text-brand-600 rounded-full cursor-pointer"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-brand-600 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-100 bg-white/95 backdrop-blur-md animate-fade-in-up">
          <div className="space-y-1.5 px-4 py-4.5">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-stone-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-stone-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              Shop Flour
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-semibold text-brand-700 bg-brand-50 transition-colors"
              >
                Admin Panel
              </Link>
            )}

            <div className="h-px bg-stone-100 my-3"></div>

            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <p className="text-xs text-stone-400">Signed in as</p>
                  <p className="text-sm font-semibold text-stone-800 truncate">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-stone-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <User className="h-5 w-5 text-stone-400" />
                  My Profile & Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-stone-200 py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
