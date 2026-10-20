import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Wheat, ShoppingBag, Plus, Minus, ArrowLeft, ShieldCheck, Truck, CheckCircle } from 'lucide-react';

const DEFAULT_PRODUCTS_MAP = {
  '1': {
    id: 1,
    name: 'Azania PPF Pure Patent Flour',
    brand: 'Azania',
    weight: '25kg',
    price: 19500,
    stockQuantity: 150,
    imageUrl: '/images/azania-ppf.jpg',
    description: 'Premium pure patent wheat flour ideal for high quality pastries, breads, mandazi, and chapati.',
  },
  '2': {
    id: 2,
    name: 'Azam Home Baking Flour',
    brand: 'Azam',
    weight: '5kg',
    price: 4500,
    stockQuantity: 120,
    imageUrl: '/images/azam-wheat-flour.jpg',
    description: '100% Super Fine wheat flour, Africa\'s No. 1 choice for home baking, mandazi, and chapatis.',
  },
  '3': {
    id: 3,
    name: 'Kinazi Fine Cassava Flour',
    brand: 'Kinazi',
    weight: '10kg',
    price: 9000,
    stockQuantity: 80,
    imageUrl: '/images/kinazi-cassava-flour.jpg',
    description: 'High quality 100% fine cassava flour processed locally by Kinazi Cassava Plant Ltd for daily meals.',
  },
  '4': {
    id: 4,
    name: 'Akubuzimafarine Kawunga Grade 1 Maize Flour',
    brand: 'Akubuzimafarine',
    weight: '25kg',
    price: 16500,
    stockQuantity: 200,
    imageUrl: '/images/maize-flour.jpg',
    description: 'Super quality Grade 1 white maize meal (Kawunga) made in Rwanda (Kayonza-Nyamirama) for soft Ubugali.',
  }
};

export const ProductDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setProduct(DEFAULT_PRODUCTS_MAP[id] || DEFAULT_PRODUCTS_MAP['1']);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(DEFAULT_PRODUCTS_MAP[id] || DEFAULT_PRODUCTS_MAP['1']);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product, quantity);
      const amountToPay = ((product.price || 0) * quantity).toLocaleString();
      setNotification(`Added ${quantity} bag(s) of ${product.name} to cart! Total: ${amountToPay} RWF`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const getProductImage = (prod) => {
    if (prod && prod.imageUrl && !prod.imageUrl.includes('unsplash')) {
      return prod.imageUrl;
    }
    const nameLower = (prod?.name || '').toLowerCase();
    if (nameLower.includes('azania')) return '/images/azania-ppf.jpg';
    if (nameLower.includes('azam')) return '/images/azam-wheat-flour.jpg';
    if (nameLower.includes('kinazi') || nameLower.includes('cassava')) return '/images/kinazi-cassava-flour.jpg';
    if (nameLower.includes('maize') || nameLower.includes('kawunga')) return '/images/maize-flour.jpg';
    return '/images/azania-ppf.jpg';
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-20 animate-pulse space-y-8 text-left">
        <div className="h-6 w-24 bg-stone-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-stone-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-stone-200 rounded"></div>
            <div className="h-6 w-1/4 bg-stone-200 rounded"></div>
            <div className="h-20 w-full bg-stone-200 rounded"></div>
            <div className="h-10 w-1/3 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const unitPrice = product.price || 0;
  const amountToPay = unitPrice * quantity;
  const image = getProductImage(product);

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-3 animate-fade-in-up text-sm font-semibold">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-850 font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back to Shop
      </button>

      {/* Product Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image Panel */}
        <div className="relative aspect-[4/3] bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur border border-stone-150 rounded-full text-xs font-bold uppercase tracking-wider text-stone-700 shadow-xs">
            {product.brand}
          </span>
        </div>

        {/* Product Info Panel */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-650 uppercase tracking-widest">
              Flour Product
            </span>
            <h1 className="text-3xl font-serif font-bold text-stone-950 leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-sm text-stone-500 font-medium">Weight: {product.weight}</span>
              <span className="h-1.5 w-1.5 bg-stone-300 rounded-full"></span>
              {product.stockQuantity <= 0 ? (
                <span className="px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase">
                  Out of Stock
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase">
                  In Stock ({product.stockQuantity} available)
                </span>
              )}
            </div>
          </div>

          <div className="pb-4 border-b border-stone-100">
            <span className="text-xs text-stone-400 font-medium block">Unit Price:</span>
            <p className="text-2xl font-extrabold text-stone-900">
              {unitPrice.toLocaleString()} RWF
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900">Product Description</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {product.description || 'No description available for this premium flour product.'}
            </p>
          </div>

          {/* Quantity Selector & Amount to Pay */}
          {product.stockQuantity > 0 && (
            <div className="pt-2 space-y-4">
              <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-800">Select Quantity:</span>
                  <div className="flex items-center gap-2 bg-white border border-stone-250 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                      disabled={quantity <= 1 || adding}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-base font-extrabold w-8 text-center text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 99, q + 1))}
                      className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                      disabled={quantity >= (product.stockQuantity || 99) || adding}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Amount to be Paid for this product */}
                <div className="flex justify-between items-center pt-2 border-t border-brand-200/60">
                  <div>
                    <span className="text-xs text-stone-500 font-semibold block">Total Amount to Pay for this Product:</span>
                    <span className="text-xs text-stone-400">({quantity} bag(s) x {unitPrice.toLocaleString()} RWF)</span>
                  </div>
                  <span className="text-xl font-extrabold text-brand-900 bg-white px-3.5 py-1 rounded-xl border border-brand-200 shadow-2xs">
                    {amountToPay.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-base transition-all shadow-md shadow-brand-100 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                disabled={adding}
              >
                <ShoppingBag className="h-5 w-5" />
                Add {quantity} Bag(s) to Cart ({amountToPay.toLocaleString()} RWF)
              </button>
            </div>
          )}

          {/* Delivery & Quality Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-stone-100">
            <div className="flex gap-2.5 items-start text-left">
              <Truck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-stone-850">Local Doorstep Delivery</h4>
                <p className="text-xs text-stone-500 leading-normal mt-0.5">
                  Fast delivery across Kigali and all provincial locations in Rwanda.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start text-left">
              <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-stone-850">Certified Quality</h4>
                <p className="text-xs text-stone-500 leading-normal mt-0.5">
                  100% moisture tested and standard compliant baking flours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

