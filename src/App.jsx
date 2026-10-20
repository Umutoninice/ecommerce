import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartSlideOver } from './components/CartSlideOver';

// Customer Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { OrderDetails } from './pages/OrderDetails';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Admin Dashboard
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar onCartToggle={() => setCartOpen(!cartOpen)} />

        {/* Global Cart Slide Over Sidebar */}
        <CartSlideOver isOpen={cartOpen} onClose={() => setCartOpen(false)} />

        {/* Page Content area */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Dynamic Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
