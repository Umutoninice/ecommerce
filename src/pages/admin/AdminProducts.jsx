import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal, Eye, X } from 'lucide-react';

export const AdminProducts = () => {
  const { authFetch } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search/Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    weight: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    lowStockThreshold: 10,
    warehouseLocation: '',
  });

  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await authFetch('/api/categories');
      setCategories(data || []);
      if (data && data.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: data[0].id.toString() }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${page}&size=5&sortBy=id&sortDir=desc`;
      if (selectedCat) {
        url += `&categoryId=${selectedCat}`;
      }
      if (searchText) {
        url += `&search=${encodeURIComponent(searchText)}`;
      }
      const data = await authFetch(url);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchText, selectedCat, page]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?.id.toString() || '',
      brand: '',
      weight: '',
      price: '',
      stockQuantity: '',
      imageUrl: '',
      lowStockThreshold: 10,
      warehouseLocation: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      categoryId: p.categoryId?.toString() || p.category?.id?.toString() || categories[0]?.id?.toString() || '',
      brand: p.brand || '',
      weight: p.weight || '',
      price: p.price || '',
      stockQuantity: p.stockQuantity || '',
      imageUrl: p.imageUrl || '',
      lowStockThreshold: p.lowStockThreshold || 10,
      warehouseLocation: p.warehouseLocation || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? All inventory logs will be deleted.')) return;
    try {
      await authFetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
      };

      if (isEditing) {
        await authFetch(`/api/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to save product details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Manage Flour Products</h1>
          <p className="text-xs text-stone-500">Add, edit, adjust stocks, and delete baking flour products.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-xs focus:outline-none bg-stone-50"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="h-4 w-4 text-stone-400" />
          <select
            value={selectedCat}
            onChange={(e) => {
              setSelectedCat(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl text-xs bg-stone-50 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-10 w-full bg-stone-100 rounded-lg"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-xs text-stone-400 space-y-2">
            <PackageOpen className="h-10 w-10 text-stone-300 mx-auto" />
            <p>No products found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-150 text-stone-450 uppercase font-bold text-left bg-stone-50 tracking-wider">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Flour Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4 text-center">Weight</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-4 shrink-0">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5'}
                        alt={p.name}
                        className="h-10 w-10 object-cover rounded-lg border border-stone-200"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-bold text-stone-900 leading-tight">
                      {p.name}
                      <span className="block text-[10px] text-stone-400 font-semibold mt-0.5 capitalize">
                        {p.categoryName || categories.find((c) => c.id === p.categoryId)?.name || 'Wheat Flour'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-stone-500 font-medium">{p.brand || '-'}</td>
                    <td className="py-2.5 px-4 text-center text-stone-500 font-bold">{p.weight}</td>
                    <td className="py-2.5 px-4 font-extrabold text-brand-900">{p.price?.toLocaleString()} RWF</td>
                    <td className="py-2.5 px-4 text-center font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          p.stockQuantity <= 0
                            ? 'bg-red-50 text-red-750'
                            : p.stockQuantity < 10
                            ? 'bg-amber-50 text-amber-750'
                            : 'bg-emerald-50 text-emerald-750'
                        }`}
                      >
                        {p.stockQuantity} bags
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-stone-405 hover:text-red-650 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="px-3.5 py-1.5 border border-stone-200 hover:bg-stone-50 rounded-lg disabled:opacity-40 text-xs font-semibold cursor-pointer"
          >
            Prev
          </button>
          {[...Array(totalPages).keys()].map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-7 w-7 text-xs font-bold rounded-lg border flex items-center justify-center cursor-pointer ${
                page === p ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
            >
              {p + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages - 1}
            className="px-3.5 py-1.5 border border-stone-200 hover:bg-stone-50 rounded-lg disabled:opacity-40 text-xs font-semibold cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-xl w-full z-10 shadow-2xl overflow-y-auto max-h-[85vh] text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h2 className="text-lg font-serif font-bold text-stone-950">
                {isEditing ? 'Modify Product Details' : 'Register New Flour Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-stone-605">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-stone-600 block">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pembe Home Baking Flour"
                  className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-stone-600 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Introduce product features..."
                  className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850 h-20 resize-none"
                  disabled={saving}
                />
              </div>

              {/* Category, Brand, Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Category *</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850 cursor-pointer"
                    disabled={saving}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Pembe"
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Weight *</label>
                  <input
                    type="text"
                    name="weight"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 5kg, 25kg"
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Price, Stock, Low Stock Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Price (RWF) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="1"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 4200"
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Stock Qty *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Low Stock Alert *</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    required
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Image URL, Warehouse Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://unsplash..."
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-600 block">Warehouse Location</label>
                  <input
                    type="text"
                    name="warehouseLocation"
                    value={formData.warehouseLocation}
                    onChange={handleChange}
                    placeholder="e.g. Kigali Block A"
                    className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-stone-250 hover:bg-stone-50 rounded-xl transition-all cursor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all cursor-pointer"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
