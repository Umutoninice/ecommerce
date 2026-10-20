import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, Wheat, SlidersHorizontal, ShoppingBag, Eye, Plus, Minus, CheckCircle } from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Azania PPF Pure Patent Flour',
    brand: 'Azania',
    weight: '25kg',
    price: 19500,
    stockQuantity: 150,
    imageUrl: '/images/azania-ppf.jpg',
    description: 'Premium pure patent wheat flour ideal for high quality pastries, breads, mandazi, and chapati.',
    categoryId: 1
  },
  {
    id: 2,
    name: 'Azam Home Baking Flour',
    brand: 'Azam',
    weight: '5kg',
    price: 4500,
    stockQuantity: 120,
    imageUrl: '/images/azam-wheat-flour.jpg',
    description: '100% Super Fine wheat flour, Africa\'s No. 1 choice for home baking, mandazi, and chapatis.',
    categoryId: 1
  },
  {
    id: 3,
    name: 'Kinazi Fine Cassava Flour',
    brand: 'Kinazi',
    weight: '10kg',
    price: 9000,
    stockQuantity: 80,
    imageUrl: '/images/kinazi-cassava-flour.jpg',
    description: 'High quality 100% fine cassava flour processed locally by Kinazi Cassava Plant Ltd for daily meals.',
    categoryId: 3
  },
  {
    id: 4,
    name: 'Akubuzimafarine Kawunga Grade 1 Maize Flour',
    brand: 'Akubuzimafarine',
    weight: '25kg',
    price: 16500,
    stockQuantity: 200,
    imageUrl: '/images/maize-flour.jpg',
    description: 'Super quality Grade 1 white maize meal (Kawunga) made in Rwanda (Kayonza-Nyamirama) for soft Ubugali.',
    categoryId: 2
  }
];

export const Shop = () => {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Wheat Flour' },
    { id: 2, name: 'Maize Flour' },
    { id: 3, name: 'Specialty Flour' }
  ]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  
  // Track selected quantity for each product: { [productId]: quantity }
  const [productQuantities, setProductQuantities] = useState({});

  // Get filter values from searchParams
  const categoryId = searchParams.get('categoryId') || '';
  const searchVal = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const sortDir = searchParams.get('sortDir') || 'asc';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${page}&size=6&sortBy=price&sortDir=${sortDir}`;
        if (categoryId) {
          url += `&categoryId=${categoryId}`;
        }
        if (searchVal) {
          url += `&search=${encodeURIComponent(searchVal)}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          let list = data.content || [];
          if (list.length === 0 && !searchVal && !categoryId) {
            list = DEFAULT_PRODUCTS;
          }
          setProducts(list);
          setTotalPages(data.totalPages || 1);
        } else {
          setProducts(filterDefaultProducts(DEFAULT_PRODUCTS, categoryId, searchVal, sortDir));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(filterDefaultProducts(DEFAULT_PRODUCTS, categoryId, searchVal, sortDir));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, searchVal, page, sortDir]);

  const filterDefaultProducts = (list, catId, query, dir) => {
    let res = [...list];
    if (catId) {
      res = res.filter((p) => p.categoryId?.toString() === catId.toString());
    }
    if (query) {
      const q = query.toLowerCase();
      res = res.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (dir === 'desc') {
      res.sort((a, b) => b.price - a.price);
    } else {
      res.sort((a, b) => a.price - b.price);
    }
    return res;
  };

  const getQuantity = (productId) => productQuantities[productId] || 1;

  const handleQtyChange = (productId, delta, maxStock) => {
    const current = getQuantity(productId);
    const updated = Math.max(1, Math.min(maxStock || 99, current + delta));
    setProductQuantities((prev) => ({ ...prev, [productId]: updated }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = fd.get('searchText')?.toString().trim();
    
    const params = new URLSearchParams(searchParams);
    if (text) {
      params.set('search', text);
    } else {
      params.delete('search');
    }
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleCategorySelect = (id) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('categoryId', id);
    } else {
      params.delete('categoryId');
    }
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleSortChange = (dir) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortDir', dir);
    setSearchParams(params);
  };

  const handlePageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (product) => {
    const qty = getQuantity(product.id);
    try {
      await addToCart(product, qty);
      const subtotal = (product.price * qty).toLocaleString();
      setNotification(`Added ${qty} bag(s) of ${product.name} to cart! (Subtotal: ${subtotal} RWF)`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add item');
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

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-3 animate-fade-in-up text-sm font-semibold">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Our Flour Catalog</h1>
        <p className="text-sm text-stone-500 max-w-xl">
          Browse premium baking flours, local maize meal, and cassava flour from top millers in Rwanda.
        </p>
      </div>

      {/* Filters & Search Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar (Left Column) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-stone-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-stone-500" />
              Filter Catalog
            </h3>
            {(categoryId || searchVal) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-brand-650 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-bold text-stone-600">Search Product</label>
            <div className="relative">
              <input
                type="text"
                name="searchText"
                defaultValue={searchVal}
                placeholder="Search Azania, Azam, Kinazi..."
                className="w-full pl-9 pr-4 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-sm focus:outline-none bg-stone-50"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 block">Flour Categories</label>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  !categoryId
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                    : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id.toString())}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    categoryId === cat.id.toString()
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                      : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 block">Sort Price</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('asc')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border text-center transition-colors ${
                  sortDir === 'asc'
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Low to High
              </button>
              <button
                onClick={() => handleSortChange('desc')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border text-center transition-colors ${
                  sortDir === 'desc'
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                High to Low
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid (Right Columns) */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="border border-stone-150 rounded-2xl p-5 space-y-4 animate-pulse">
                  <div className="w-full aspect-[4/3] bg-stone-200 rounded-xl"></div>
                  <div className="h-4 w-2/3 bg-stone-200 rounded"></div>
                  <div className="h-3.5 w-1/3 bg-stone-200 rounded"></div>
                  <div className="h-10 w-full bg-stone-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-150 space-y-4">
              <Wheat className="h-12 w-12 text-stone-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-stone-800">No products found</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                We couldn't find any products matching your search filters. Try selecting a different category or resetting your search.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full shadow cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
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
                        {/* Image Showcase */}
                        <div
                          className="relative aspect-[4/3] bg-stone-50 rounded-xl overflow-hidden mb-4 cursor-pointer border border-stone-100"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          <img
                            src={img}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/90 backdrop-blur border border-stone-150 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-xs">
                            {product.brand}
                          </span>
                          {product.stockQuantity <= 0 ? (
                            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-red-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow">
                              In Stock
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h3
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="text-sm font-bold text-stone-900 hover:text-brand-700 transition-colors line-clamp-2 cursor-pointer leading-tight"
                          >
                            {product.name}
                          </h3>
                          <p className="text-xs text-stone-500 line-clamp-2 leading-normal">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 space-y-3.5">
                        {/* Unit Price & Weight */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-stone-500 font-medium">Weight: {product.weight}</span>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block font-medium">Unit Price</span>
                            <span className="text-sm font-extrabold text-stone-800">
                              {price.toLocaleString()} RWF
                            </span>
                          </div>
                        </div>

                        {/* Quantity picker & Amount to pay calculation */}
                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-600">Select Quantity:</span>
                            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                              <button
                                onClick={() => handleQtyChange(product.id, -1, product.stockQuantity)}
                                className="p-1 text-stone-600 hover:bg-stone-100 rounded transition-colors disabled:opacity-40 cursor-pointer"
                                disabled={qty <= 1}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-xs font-bold w-6 text-center text-stone-900">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleQtyChange(product.id, 1, product.stockQuantity)}
                                className="p-1 text-stone-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Highlighted Amount to be paid */}
                          <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                            <span className="text-[11px] text-stone-500 font-medium">Amount to Pay:</span>
                            <span className="text-sm font-extrabold text-brand-900">
                              {amountToPay.toLocaleString()} RWF
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-5 gap-2">
                          <button
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="col-span-1.5 p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="col-span-3.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs hover:shadow active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            disabled={product.stockQuantity <= 0}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-sm font-semibold rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages).keys()].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-9 w-9 text-sm font-semibold rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                        page === p
                          ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {p + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-sm font-semibold rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

