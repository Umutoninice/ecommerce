import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';

export const AdminCategories = () => {
  const { authFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await authFetch('/api/categories');
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFormData({
      name: c.name || '',
      description: c.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated products will be deleted.')) return;
    try {
      await authFetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await authFetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to save category details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Manage Flour Categories</h1>
          <p className="text-xs text-stone-500">Create, edit and delete categories representing types of flour.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 space-y-4 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="h-10 w-full bg-stone-105 bg-stone-200 rounded-lg"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-xs text-stone-400 space-y-2">
            <Tag className="h-10 w-10 text-stone-305 text-stone-300 mx-auto" />
            <p>No categories configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-150 text-stone-455 text-stone-450 uppercase font-bold text-left bg-stone-50 tracking-wider">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Category Name</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-6 text-stone-500 font-bold">#{c.id}</td>
                    <td className="py-4 px-6 font-bold text-stone-900 leading-tight">{c.name}</td>
                    <td className="py-4 px-6 text-stone-600 font-medium leading-relaxed max-w-sm truncate">
                      {c.description || '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 hover:bg-stone-100 rounded text-stone-505 text-stone-500 hover:text-stone-850 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-stone-405 hover:text-red-650 transition-colors cursor-pointer"
                          title="Delete Category"
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

      {/* Edit/Create Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-md w-full z-10 shadow-2xl text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-stone-105 border-stone-100">
              <h2 className="text-lg font-serif font-bold text-stone-950">
                {isEditing ? 'Modify Category' : 'Create Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 cursor-pointer">
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-stone-600">
              <div className="space-y-1.5">
                <label className="block text-stone-605">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Millet Flour"
                  className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850"
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-605">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of flour usage..."
                  className="w-full px-3 py-2 border border-stone-200 focus:border-brand-500 rounded-xl focus:outline-none bg-stone-50 text-stone-850 h-24 resize-none"
                  disabled={saving}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl transition-all cursor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all cursor-pointer"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
