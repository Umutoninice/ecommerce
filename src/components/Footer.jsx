import React from 'react';
import { Link } from 'react-router-dom';
import { Wheat, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wheat className="h-6 w-6 text-brand-500" />
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Flour<span className="text-brand-500 font-sans font-light">.rw</span>
              </span>
            </div>
            <p className="text-sm text-stone-400">
              Premium wholesale and retail flour distribution across Rwanda. Sourcing from local millers and importing the finest baking flours.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop?categoryId=1" className="hover:text-brand-400 transition-colors">Wheat Flour</Link>
              </li>
              <li>
                <Link to="/shop?categoryId=2" className="hover:text-brand-400 transition-colors">Maize Flour</Link>
              </li>
              <li>
                <Link to="/shop?categoryId=3" className="hover:text-brand-400 transition-colors">Specialty Flour</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-brand-400 transition-colors">All Products</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Info</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/profile" className="hover:text-brand-400 transition-colors">Order Tracking</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-brand-400 transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <span className="text-stone-500">Momo webhook simulation is enabled in staging.</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-brand-500 shrink-0" />
                <span>Kigali Free Zone, Block A, Rwanda</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 text-brand-500 shrink-0" />
                <span>+250 780 000 000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-brand-500 shrink-0" />
                <span>info@flour.rw</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Flour.rw. All rights reserved.</p>
          <p>Powered by MTN MoMo, Airtel Money, and Rwanda Local Millers Co.</p>
        </div>
      </div>
    </footer>
  );
};
