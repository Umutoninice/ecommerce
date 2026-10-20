import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Wheat, Landmark, ShoppingBag, ShieldCheck, ArrowRight, Star, Plus, Minus, CheckCircle } from 'lucide-react';

const DEFAULT_FEATURED = [
  {
    id: 1,
    name: 'Azania PPF Pure Patent Flour',
    brand: 'Azania',
    weight: '25kg',
    price: 19500,
    stockQuantity: 150,
    imageUrl: '/images/azania-ppf.jpg',
    description: 'Premium pure patent wheat flour ideal for high quality pastries, breads, mandazi, and chapati.'
  },
  {
    id: 2,
    name: 'Azam Home Baking Flour',
    brand: 'Azam',
    weight: '5kg',
    price: 4500,
    stockQuantity: 120,
    imageUrl: '/images/azam-wheat-flour.jpg',
    description: '100% Super Fine wheat flour, Africa\'s No. 1 choice for home baking, mandazi, and chapatis.'
  },
  {
    id: 3,
    name: 'Kinazi Fine Cassava Flour',
    brand: 'Kinazi',
    weight: '10kg',
    price: 9000,
    stockQuantity: 80,
    imageUrl: '/images/kinazi-cassava-flour.jpg',
    description: 'High quality 100% fine cassava flour processed locally by Kinazi Cassava Plant Ltd for daily meals.'
  },
  {
    id: 4,
    name: 'Akubuzimafarine Kawunga Grade 1 Maize Flour',
    brand: 'Akubuzimafarine',
    weight: '25kg',
    price: 16500,
    stockQuantity: 200,
    imageUrl: '/images/maize-flour.jpg',
    description: 'Super quality Grade 1 white maize meal (Kawunga) made in Rwanda (Kayonza-Nyamirama) for soft Ubugali.'
  }
];

export const Home = () => {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [productQuantities, setProductQuantities] = useState({});

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/products?size=4');
        if (response.ok) {
          const data = await response.json();
          const list = data.content || [];
          setFeaturedProducts(list.length > 0 ? list : DEFAULT_FEATURED);
        } else {
          setFeaturedProducts(DEFAULT_FEATURED);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts(DEFAULT_FEATURED);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const getQuantity = (productId) => productQuantities[productId] || 1;

  const handleQtyChange = (productId, delta, maxStock) => {
    const current = getQuantity(productId);
    const updated = Math.max(1, Math.min(maxStock || 99, current + delta));
    setProductQuantities((prev) => ({ ...prev, [productId]: updated }));
  };

  const handleAddToCart = async (product) => {
    const qty = getQuantity(product.id);
    try {
      await addToCart(product, qty);
      const subtotal = (product.price * qty).toLocaleString();
      setNotification(`Added ${qty} bag(s) of ${product.name} to cart! (Subtotal: ${subtotal} RWF)`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const getProductImage = (product) => {
    if (product.imageUrl && !product.imageUrl.includes('unsplash')) {
      return product.imageUrl;
    }
    const nameLower = (product.name || '').toLowerCase();
    if (nameLower.includes('azania')) return '/images/azania-ppf.jpg';
    if (nameLower.includes('azam')) return '/images/azam-wheat-flour.jpg';
    if (nameLower.includes('kinazi') || nameLower.includes('cassava')) return '/images/kinazi-cassava-flour.jpg';
    if (nameLower.includes('maize') || nameLower.includes('kawunga')) return '/images/maize-flour.jpg';
    return '/images/azania-ppf.jpg';
  };

  const categories = [
    {
      id: 1,
      name: 'Wheat Flour',
      desc: 'Premium Azania PPF & Azam ground wheat for chapatis, mandazi, breads and cakes.',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
    },
    {
      id: 2,
      name: 'Maize Flour',
      desc: 'Superfine Akubuzimafarine Grade 1 white maize meal for Rwanda\'s staple Ubugali.',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    {
      id: 3,
      name: 'Specialty Flour',
      desc: 'Kinazi fine cassava flour, gluten-free alternatives, sorghum, and organic starches.',
      bg: 'bg-stone-50',
      border: 'border-stone-200',
      iconColor: 'text-stone-700',
    },
  ];

  return (
    <div className="flex-1 space-y-16 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-3 animate-fade-in-up text-sm font-semibold">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-brand-50/20 to-transparent pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-left max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-xs font-bold tracking-wide uppercase">
                <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
                Rwanda's No. 1 Flour Hub
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-950 leading-tight">
                Quality Flour for <span className="text-brand-650 underline decoration-brand-200 decoration-wavy">Perfect Baking</span>
              </h1>
              <p className="text-base md:text-lg text-stone-600 leading-relaxed">
                Order Azania PPF, Azam Super Fine, Kinazi Cassava Flour, and Akubuzimafarine Maize Flour with local door-to-door delivery across Rwanda.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/shop"
                  className="px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-full shadow-md shadow-brand-150 hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  Shop Catalog Now
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-7 py-3.5 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 font-semibold rounded-full transition-all active:scale-95 cursor-pointer"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Graphics: Flour Collage */}
            <div className="relative">
              <div className="absolute inset-0 bg-brand-300/20 rounded-3xl filter blur-3xl -z-10 translate-x-4 translate-y-4"></div>
              <div className="bg-white p-3 rounded-3xl border border-stone-200 shadow-xl overflow-hidden aspect-[4/3] grid grid-cols-2 gap-2">
                <img
                  src="/images/azania-ppf.jpg"
                  alt="Azania PPF Flour"
                  className="w-full h-full object-cover rounded-xl border border-stone-150 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="/images/azam-wheat-flour.jpg"
                  alt="Azam Home Baking Flour"
                  className="w-full h-full object-cover rounded-xl border border-stone-150 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="/images/kinazi-cassava-flour.jpg"
                  alt="Kinazi Cassava Flour"
                  className="w-full h-full object-cover rounded-xl border border-stone-150 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="/images/maize-flour.jpg"
                  alt="Akubuzimafarine Maize Flour"
                  className="w-full h-full object-cover rounded-xl border border-stone-150 hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif font-bold text-stone-900">Explore Our Categories</h2>
          <p className="text-sm text-stone-500">
            Carefully curated wheat, maize, and specialty flours to elevate your home baking and meals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?categoryId=${cat.id}`}
              className={`p-6 rounded-2xl border ${cat.border} ${cat.bg} text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1 block group`}
            >
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-stone-100 mb-4 group-hover:scale-110 transition-transform">
                <Wheat className={`h-6 w-6 ${cat.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-stone-900 group-hover:text-brand-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                {cat.desc}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-brand-650 font-bold mt-4 group-hover:underline">
                Explore Products
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-brand-50/50 py-16 border-y border-brand-100/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-serif font-bold text-stone-900">Seamless Doorstep Deliveries</h2>
            <p className="text-sm text-stone-500">
              Get premium quality flour delivered directly to your home in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
              <div className="h-12 w-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto text-base font-extrabold">
                1
              </div>
              <h3 className="text-base font-bold text-stone-900">Select Flour & Quantity</h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[260px] mx-auto">
                Pick your preferred bag size, choose quantities, and instantly view the exact amount to be paid per product.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
              <div className="h-12 w-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto text-base font-extrabold">
                2
              </div>
              <h3 className="text-base font-bold text-stone-900">Checkout via Mobile Money</h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[260px] mx-auto">
                Enter delivery details, select MTN MoMo or Airtel Money, and confirm payment seamlessly.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
              <div className="h-12 w-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto text-base font-extrabold">
                3
              </div>
              <h3 className="text-base font-bold text-stone-900">Track Fast Delivery</h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[260px] mx-auto">
                Monitor your delivery progress step-by-step until your flour arrives at your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-serif font-bold text-stone-900">Recommended Products</h2>
            <p className="text-sm text-stone-500">
              Check out top flour products with clear pricing and quantity controls.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-brand-650 hover:text-brand-800 transition-colors flex items-center gap-1 group self-start sm:self-auto"
          >
            View Full Catalog
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="border border-stone-150 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="w-full aspect-[4/3] bg-stone-200 rounded-xl"></div>
                <div className="h-4 w-2/3 bg-stone-200 rounded"></div>
                <div className="h-3 w-1/3 bg-stone-200 rounded"></div>
                <div className="h-10 w-full bg-stone-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const qty = getQuantity(product.id);
              const price = product.price || 0;
              const amountToPay = price * qty;
              const img = getProductImage(product);

              return (
                <div
                  key={product.id}
                  className="group border border-stone-200 hover:border-brand-300 bg-white rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="relative aspect-[4/3] bg-stone-50 rounded-xl overflow-hidden mb-4 cursor-pointer border border-stone-100"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/90 backdrop-blur border border-stone-150 rounded-full text-[10px] font-bold tracking-wide uppercase text-stone-700 shadow-xs">
                        {product.brand}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="text-sm font-bold text-stone-900 hover:text-brand-700 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-stone-400 font-medium">Weight: {product.weight}</span>
                      <span className="font-extrabold text-stone-800">{price.toLocaleString()} RWF</span>
                    </div>

                    {/* Quantity Picker & Amount to Pay */}
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-600">Qty:</span>
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => handleQtyChange(product.id, -1, product.stockQuantity)}
                            className="p-1 text-stone-600 hover:bg-stone-100 rounded transition-colors disabled:opacity-40 cursor-pointer"
                            disabled={qty <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center text-stone-900">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQtyChange(product.id, 1, product.stockQuantity)}
                            className="p-1 text-stone-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                        <span className="text-[10px] text-stone-500 uppercase font-bold">Amount to Pay:</span>
                        <span className="text-xs font-extrabold text-brand-900">
                          {amountToPay.toLocaleString()} RWF
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs hover:shadow active:scale-98 cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Guarantee */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-brand-900 text-white p-8 md:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8 shadow-lg">
          <div className="flex gap-4 items-start text-left">
            <ShieldCheck className="h-10 w-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-lg font-bold">100% Quality Inspected</h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                All grains are checked for moisture levels and standard certification before bagging.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start text-left">
            <Landmark className="h-10 w-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-lg font-bold">Secure Local Payment</h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Integrated with local Rwandan telecom providers for seamless Mobile Money checkout.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start text-left">
            <Wheat className="h-10 w-10 text-brand-400 shrink-0" />
            <div>
              <h4 className="text-lg font-bold">Supporting Local Mills</h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                We work directly with millers in Kigali, Musanze, and Kayonza to sustain local agribusiness.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

