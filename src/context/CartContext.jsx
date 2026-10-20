import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token, authFetch } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('flour_guest_cart');
    return saved ? JSON.parse(saved) : { items: [], totalAmount: 0 };
  });
  const [loading, setLoading] = useState(false);

  // Helper to re-calculate local cart total
  const calculateLocalCartTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => {
      const price = Number(item.productPrice) || 0;
      const qty = Number(item.quantity) || 0;
      const subtotal = item.subtotal !== undefined ? item.subtotal : price * qty;
      return sum + subtotal;
    }, 0);
    return { items, totalAmount };
  };

  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const cartData = await authFetch('/api/cart');
      if (cartData && cartData.items) {
        setCart(cartData);
      }
    } catch (error) {
      console.error('Error fetching cart from API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync guest cart to server on login
  const syncGuestCartToServer = async () => {
    const saved = localStorage.getItem('flour_guest_cart');
    if (!saved) return;
    try {
      const guestData = JSON.parse(saved);
      if (guestData && guestData.items && guestData.items.length > 0) {
        for (const item of guestData.items) {
          const pId = item.productId || item.id;
          await authFetch('/api/cart/items', {
            method: 'POST',
            body: JSON.stringify({ productId: pId, quantity: item.quantity }),
          }).catch((e) => console.error(e));
        }
        localStorage.removeItem('flour_guest_cart');
      }
    } catch (err) {
      console.error('Failed to sync guest cart:', err);
    }
  };

  useEffect(() => {
    if (token) {
      syncGuestCartToServer().then(() => fetchCart());
    } else {
      const saved = localStorage.getItem('flour_guest_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart({ items: [], totalAmount: 0 });
      }
    }
  }, [token]);

  // Persist guest cart to local storage when not logged in
  const updateGuestCart = (newItems) => {
    const formattedItems = newItems.map((item) => ({
      ...item,
      subtotal: (item.productPrice || 0) * (item.quantity || 1),
    }));
    const newCart = calculateLocalCartTotal(formattedItems);
    setCart(newCart);
    localStorage.setItem('flour_guest_cart', JSON.stringify(newCart));
  };

  const addToCart = async (productOrId, quantity = 1) => {
    let productObj = typeof productOrId === 'object' ? productOrId : { id: productOrId };
    
    // If only ID passed and not an object with details, try to fetch details or construct dummy
    if (typeof productOrId === 'number' || typeof productOrId === 'string') {
      try {
        const res = await fetch(`/api/products/${productOrId}`);
        if (res.ok) {
          productObj = await res.json();
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (token) {
      try {
        const updatedCart = await authFetch('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: productObj.id, quantity }),
        });
        setCart(updatedCart);
        return updatedCart;
      } catch (error) {
        console.error('Error adding to API cart:', error);
        throw error;
      }
    } else {
      // Guest cart logic
      const currentItems = [...(cart?.items || [])];
      const existingIdx = currentItems.findIndex(
        (i) => i.productId === productObj.id || i.id === productObj.id
      );

      if (existingIdx >= 0) {
        const existing = currentItems[existingIdx];
        const newQty = existing.quantity + quantity;
        currentItems[existingIdx] = {
          ...existing,
          quantity: newQty,
          subtotal: (existing.productPrice || 0) * newQty,
        };
      } else {
        const price = Number(productObj.price) || 0;
        currentItems.push({
          id: `guest-${productObj.id}-${Date.now()}`,
          productId: productObj.id,
          productName: productObj.name || 'Flour Product',
          productWeight: productObj.weight || '25kg',
          productPrice: price,
          productBrand: productObj.brand || 'Flour',
          productImageUrl: productObj.imageUrl || '/images/azania-ppf.jpg',
          quantity: quantity,
          subtotal: price * quantity,
        });
      }
      updateGuestCart(currentItems);
      return { items: currentItems };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (token) {
      try {
        const updatedCart = await authFetch(`/api/cart/items/${itemId}?quantity=${quantity}`, {
          method: 'PUT',
        });
        setCart(updatedCart);
        return updatedCart;
      } catch (error) {
        console.error('Error updating cart item quantity:', error);
        throw error;
      }
    } else {
      const currentItems = (cart?.items || []).map((item) => {
        if (item.id === itemId || item.productId === itemId) {
          const newQty = Math.max(1, quantity);
          return {
            ...item,
            quantity: newQty,
            subtotal: (item.productPrice || 0) * newQty,
          };
        }
        return item;
      });
      updateGuestCart(currentItems);
    }
  };

  const removeItem = async (itemId) => {
    if (token) {
      try {
        const updatedCart = await authFetch(`/api/cart/items/${itemId}`, {
          method: 'DELETE',
        });
        setCart(updatedCart);
        return updatedCart;
      } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
      }
    } else {
      const currentItems = (cart?.items || []).filter(
        (item) => item.id !== itemId && item.productId !== itemId
      );
      updateGuestCart(currentItems);
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        await authFetch('/api/cart', { method: 'DELETE' });
        setCart({ items: [], totalAmount: 0 });
      } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    } else {
      localStorage.removeItem('flour_guest_cart');
      setCart({ items: [], totalAmount: 0 });
    }
  };

  const cartCount = cart && cart.items
    ? cart.items.reduce((total, item) => total + (item.quantity || 0), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

