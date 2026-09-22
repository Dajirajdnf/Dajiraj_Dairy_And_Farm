import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineTag, HiOutlineExclamationCircle, HiOutlineEye, HiOutlineEyeOff, HiOutlineBan, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const CATEGORIES = ['milk', 'ghee', 'paneer', 'butter', 'curd', 'other'];

const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Stock Adjust Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({ type: 'in', quantity: '', reason: '' });

  const [formData, setFormData] = useState({
    name: '',
    category: 'milk',
    description: '',
    price: '',
    unit: 'litre',
    stock: 0,
    minStockAlert: 10,
    imageUrl: '',
    isPublic: true,
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'milk',
      description: '',
      price: '',
      unit: 'litre',
      stock: 0,
      minStockAlert: 10,
      imageUrl: '',
      isPublic: true,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category?.toLowerCase() || 'milk',
      description: product.description || '',
      price: product.sellingPrice ?? product.price ?? '',
      unit: product.unit || 'litre',
      stock: product.currentStock ?? product.stock ?? 0,
      minStockAlert: product.minimumStock ?? product.minStockAlert ?? 10,
      imageUrl: product.imageUrl || '',
      isPublic: product.availability ?? product.isPublic ?? true,
      isActive: product.active ?? product.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        sellingPrice: Number(formData.price),
        price: Number(formData.price),
        currentStock: Number(formData.stock),
        stock: Number(formData.stock),
        minimumStock: Number(formData.minStockAlert),
        minStockAlert: Number(formData.minStockAlert),
        availability: Boolean(formData.isPublic),
        active: Boolean(formData.isActive),
      };
      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const isCurrentlyActive = product.active !== false && product.isActive !== false;
    const newActive = !isCurrentlyActive;
    try {
      await productAPI.toggleStatus(product._id, newActive);
      toast.success(`Product marked as ${newActive ? 'Active' : 'Inactive'}`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this product? This action cannot be undone.')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product permanently deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleOpenStockAdjust = (prod) => {
    setStockProduct(prod);
    setStockAdjustment({ type: 'in', quantity: '', reason: '' });
    setStockModalOpen(true);
  };

  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!stockProduct) return;
    setSubmitting(true);
    try {
      await productAPI.adjustStock(stockProduct._id, {
        type: stockAdjustment.type,
        quantity: Number(stockAdjustment.quantity),
        reason: stockAdjustment.reason,
      });
      toast.success('Stock adjusted successfully');
      setStockModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory ? p.category === selectedCategory : true;
    const isAct = p.active !== false && p.isActive !== false;
    const matchStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? isAct
        : !isAct;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage farm dairy items, prices, public store visibility, and inventory</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white capitalize"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <HiOutlineTag className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const priceVal = product.sellingPrice ?? product.price ?? 0;
            const stockVal = product.currentStock ?? product.stock ?? 0;
            const minStockVal = product.minimumStock ?? product.minStockAlert ?? 5;
            const isLowStock = stockVal <= minStockVal;
            const isVisible = product.availability ?? product.isPublic ?? true;
            return (
              <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <HiOutlineTag className="w-12 h-12 stroke-1" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize shadow-sm">
                      {product.category}
                    </span>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                        product.active !== false ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {product.active !== false ? 'Active' : 'Inactive'}
                      </span>
                      {isVisible ? (
                        <span className="bg-emerald-500/90 text-white p-1 rounded-full text-xs shadow-sm" title="Visible in public store">
                          <HiOutlineEye className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="bg-gray-500/90 text-white p-1 rounded-full text-xs shadow-sm" title="Hidden from public store">
                          <HiOutlineEyeOff className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-emerald-700">₹{priceVal}</span>
                        <span className="text-xs text-gray-500 block">per {product.unit}</span>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400">Stock: </span>
                        <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                          {stockVal} {product.unit}s
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-0.5 ml-1.5 text-red-500 font-semibold">
                            <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> Low
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpenStockAdjust(product)}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                      >
                        Adjust Stock
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`p-2 rounded-lg transition ${
                      product.active !== false
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={product.active !== false ? 'Deactivate Product' : 'Activate Product'}
                  >
                    {product.active !== false ? (
                      <HiOutlineBan className="w-4 h-4" />
                    ) : (
                      <HiOutlineCheckCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Permanently Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Fresh Cow Milk A2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white capitalize"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="litre">Litre</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="500ml">500 ml</option>
                    <option value="500g">500 g</option>
                    <option value="piece">Piece / Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Min Alert</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Pure Gir cow farm milk..."
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Show on public website</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Active product</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockModalOpen && stockProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Adjust Inventory Stock</h3>
            <p className="text-xs text-gray-500">
              Product: <span className="font-semibold text-gray-800">{stockProduct.name}</span> (Current: {stockProduct.stock} {stockProduct.unit}s)
            </p>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'in' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      stockAdjustment.type === 'in'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    + Stock In (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'out' })}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      stockAdjustment.type === 'out'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    - Stock Out (Deduct)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Fresh farm milking morning batch, spoilage, or return"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdminPage;
