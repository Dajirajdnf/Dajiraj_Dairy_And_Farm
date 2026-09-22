import { useState, useEffect } from 'react';
import { productAPI, stockAPI } from '../../services/api';
import {
  HiOutlineCube,
  HiOutlineArrowSmUp,
  HiOutlineArrowSmDown,
  HiOutlineExclamation,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const StockPage = () => {
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' | 'entries'
  const [products, setProducts] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Quick adjust modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [adjType, setAdjType] = useState('in');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Stock Entries CRUD state
  const [stockEntries, setStockEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entrySearch, setEntrySearch] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('');
  const [entryProductFilter, setEntryProductFilter] = useState('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const initialEntryForm = {
    product: '',
    type: 'in',
    quantity: '',
    unit: '',
    purchasePrice: '',
    sellingPrice: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  };
  const [entryForm, setEntryForm] = useState(initialEntryForm);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'entries') {
      loadStockEntries();
    }
  }, [activeTab, entryTypeFilter, entryProductFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allRes, lowRes] = await Promise.all([
        productAPI.getAll(),
        productAPI.getLowStock().catch(() => ({ data: { data: [] } })),
      ]);
      const prods = allRes.data.data || allRes.data || [];
      setProducts(prods);
      setLowStockList(lowRes.data.data || lowRes.data || []);
      if (prods.length > 0 && !selectedProduct) {
        viewHistory(prods[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadStockEntries = async () => {
    setEntriesLoading(true);
    try {
      const params = {};
      if (entryTypeFilter) params.type = entryTypeFilter;
      if (entryProductFilter) params.product = entryProductFilter;
      if (entrySearch) params.search = entrySearch;

      const res = await stockAPI.getAll(params);
      setStockEntries(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stock entries');
    } finally {
      setEntriesLoading(false);
    }
  };

  const viewHistory = async (prod) => {
    setSelectedProduct(prod);
    setHistoryLoading(true);
    try {
      const res = await productAPI.getStockHistory(prod._id);
      setHistory(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenAdjust = (prod) => {
    setActiveProduct(prod);
    setAdjType('in');
    setAdjQty('');
    setAdjReason('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;
    setSubmittingAdjust(true);
    try {
      await productAPI.adjustStock(activeProduct._id, {
        type: adjType,
        quantity: Number(adjQty),
        reason: adjReason,
      });
      toast.success('Stock adjusted successfully');
      setAdjustModalOpen(false);
      await loadData();
      if (selectedProduct && selectedProduct._id === activeProduct._id) {
        viewHistory(activeProduct);
      }
      if (activeTab === 'entries') {
        loadStockEntries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Open modal for Create Entry
  const handleOpenCreateEntry = () => {
    setEditingEntry(null);
    const defaultProduct = selectedProduct?._id || (products[0]?._id ?? '');
    const foundProd = products.find((p) => p._id === defaultProduct);
    setEntryForm({
      ...initialEntryForm,
      product: defaultProduct,
      unit: foundProd?.unit || 'Liter',
      purchasePrice: foundProd?.purchasePrice || '',
      sellingPrice: foundProd?.sellingPrice || foundProd?.price || '',
    });
    setEntryModalOpen(true);
  };

  // Open modal for Edit Entry
  const handleOpenEditEntry = (entry) => {
    setEditingEntry(entry);
    setEntryForm({
      product: entry.product?._id || entry.product,
      type: entry.type || 'in',
      quantity: entry.quantity,
      unit: entry.unit || entry.product?.unit || 'Liter',
      purchasePrice: entry.purchasePrice !== undefined ? entry.purchasePrice : '',
      sellingPrice: entry.sellingPrice !== undefined ? entry.sellingPrice : '',
      supplier: entry.supplier || '',
      date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reason: entry.reason || '',
      notes: entry.notes || '',
    });
    setEntryModalOpen(true);
  };

  const handleEntryProductChange = (prodId) => {
    const found = products.find((p) => p._id === prodId);
    setEntryForm((prev) => ({
      ...prev,
      product: prodId,
      unit: found?.unit || prev.unit,
      purchasePrice: found?.purchasePrice !== undefined ? found.purchasePrice : prev.purchasePrice,
      sellingPrice: (found?.sellingPrice ?? found?.price) !== undefined ? (found?.sellingPrice ?? found?.price) : prev.sellingPrice,
    }));
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setSubmittingEntry(true);
    try {
      const payload = {
        product: entryForm.product,
        type: entryForm.type,
        quantity: Number(entryForm.quantity),
        unit: entryForm.unit,
        purchasePrice: entryForm.purchasePrice === '' ? 0 : Number(entryForm.purchasePrice),
        sellingPrice: entryForm.sellingPrice === '' ? 0 : Number(entryForm.sellingPrice),
        supplier: entryForm.supplier,
        date: entryForm.date,
        reason: entryForm.reason,
        notes: entryForm.notes,
      };

      if (editingEntry) {
        await stockAPI.update(editingEntry._id, payload);
        toast.success('Stock entry updated successfully');
      } else {
        await stockAPI.create(payload);
        toast.success('Stock entry added successfully');
      }

      setEntryModalOpen(false);
      setEditingEntry(null);
      await Promise.all([loadData(), loadStockEntries()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stock entry');
    } finally {
      setSubmittingEntry(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm(`Are you sure you want to delete this stock entry? Product inventory will be automatically reversed.`)) {
      return;
    }
    setDeletingId(entry._id);
    try {
      await stockAPI.delete(entry._id);
      toast.success('Stock entry deleted and inventory synchronized');
      await Promise.all([loadData(), loadStockEntries()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete stock entry');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock & Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory levels, low stock warnings, and transaction logs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadData();
              if (activeTab === 'entries') loadStockEntries();
            }}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleOpenCreateEntry}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Stock Entry
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('levels')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'levels'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Current Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('entries')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'entries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Stock Entries & Inward Logs
        </button>
      </div>

      {/* Low Stock Banner if any */}
      {lowStockList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <HiOutlineExclamation className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800">Low Stock Alert! ({lowStockList.length} items)</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {lowStockList.map((item) => (
                <span
                  key={item._id}
                  className="inline-flex items-center gap-1 bg-white border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {item.name}: <strong className="text-red-600">{(item.currentStock ?? item.stock)} {item.unit}</strong> left (Alert at {item.minimumStock ?? item.minStockAlert})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Stock Levels */}
      {activeTab === 'levels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Products Inventory Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Current Stock Levels</h3>
              <span className="text-xs text-gray-400 font-medium">{products.length} Products</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Product</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">In Stock</th>
                      <th className="px-6 py-3.5">Threshold</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const stockVal = p.currentStock !== undefined ? p.currentStock : (p.stock !== undefined ? p.stock : 0);
                      const minStock = p.minimumStock !== undefined ? p.minimumStock : (p.minStockAlert !== undefined ? p.minStockAlert : 5);
                      const isLow = stockVal <= minStock;
                      const isSelected = selectedProduct?._id === p._id;
                      return (
                        <tr
                          key={p._id}
                          onClick={() => viewHistory(p)}
                          className={`cursor-pointer transition ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50/50'}`}
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                          <td className="px-6 py-4 text-xs capitalize text-gray-500">{p.category}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">
                            <span className={isLow ? 'text-red-600 font-extrabold' : 'text-emerald-700'}>
                              {stockVal} {p.unit}s
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">min {minStock}</td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenAdjust(p)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm transition"
                            >
                              + / - Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Col: Transaction History for Selected Product */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-bold text-gray-900">Stock Log</h4>
                <p className="text-xs text-gray-500">
                  {selectedProduct ? selectedProduct.name : 'Select a product to view history'}
                </p>
              </div>
              <HiOutlineClock className="w-5 h-5 text-gray-400" />
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <HiOutlineCube className="w-8 h-8 mx-auto mb-2 stroke-1" />
                No transaction history recorded yet for this product.
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start justify-between text-xs border border-gray-50 bg-gray-50/50 p-2.5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span
                        className={`p-1 rounded-full ${
                          h.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {h.type === 'in' ? <HiOutlineArrowSmUp className="w-3.5 h-3.5" /> : <HiOutlineArrowSmDown className="w-3.5 h-3.5" />}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {h.type === 'in' ? '+' : '-'}{h.quantity} {selectedProduct?.unit}s
                        </p>
                        <p className="text-gray-500 text-[11px]">{h.reason || 'Manual adjustment'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Full Stock Entries & Receipts (CRUD) */}
      {activeTab === 'entries' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-60">
                <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search supplier, reason, notes..."
                  value={entrySearch}
                  onChange={(e) => setEntrySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadStockEntries()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                className="py-1.5 px-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Types</option>
                <option value="in">Inward (+)</option>
                <option value="out">Outward (-)</option>
                <option value="adjustment">Adjustment</option>
              </select>

              <select
                value={entryProductFilter}
                onChange={(e) => setEntryProductFilter(e.target.value)}
                className="py-1.5 px-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                onClick={loadStockEntries}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium transition"
              >
                <HiOutlineFilter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>

            <div className="text-xs text-gray-500 w-full md:w-auto text-right">
              Showing {stockEntries.length} entries
            </div>
          </div>

          {/* Table */}
          {entriesLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : stockEntries.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              <HiOutlineCube className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-1" />
              No stock entries found. Click "+ Add Stock Entry" to record inventory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Quantity</th>
                    <th className="px-5 py-3">Unit</th>
                    <th className="px-5 py-3">Supplier</th>
                    <th className="px-5 py-3">Rate (Buy / Sell)</th>
                    <th className="px-5 py-3">Reason / Notes</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockEntries.map((entry) => {
                    const typeColor =
                      entry.type === 'in'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : entry.type === 'out'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';
                    const typeSign = entry.type === 'in' ? '+' : entry.type === 'out' ? '-' : '±';

                    return (
                      <tr key={entry._id} className="hover:bg-gray-50/50 transition text-xs">
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {entry.date ? new Date(entry.date).toLocaleDateString() : new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {entry.product?.name || 'Deleted Product'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase ${typeColor}`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-extrabold text-gray-800">
                          {typeSign} {entry.quantity}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {entry.unit || entry.product?.unit || 'Units'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {entry.supplier || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                          {entry.purchasePrice ? `₹${entry.purchasePrice}` : '-'} / {entry.sellingPrice ? `₹${entry.sellingPrice}` : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate" title={entry.notes || entry.reason}>
                          {entry.reason || entry.notes || '-'}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditEntry(entry)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Edit Entry"
                            >
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry)}
                              disabled={deletingId === entry._id}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete Entry"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick Adjust Modal */}
      {adjustModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Adjust Stock</h3>
            <p className="text-xs text-gray-500">
              Product: <span className="font-semibold text-gray-800">{activeProduct.name}</span> (Current: {(activeProduct.currentStock ?? activeProduct.stock)} {activeProduct.unit}s)
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('in')}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      adjType === 'in'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    + Add to Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('out')}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      adjType === 'out'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    - Deduct from Stock
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 25"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Morning milking collection, damaged batch"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {submittingAdjust ? 'Applying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Entry Create/Edit Modal */}
      {entryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingEntry ? 'Edit Stock Entry' : 'Add Stock Entry / Inward Batch'}
            </h3>
            <p className="text-xs text-gray-500">
              {editingEntry
                ? 'Update transaction record. Product inventory will be automatically recalculated.'
                : 'Record inward purchase, outward disposal, or batch adjustment with supplier details.'}
            </p>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product *</label>
                  <select
                    required
                    value={entryForm.product}
                    onChange={(e) => handleEntryProductChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Current: {(p.currentStock ?? p.stock)} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Entry Type *</label>
                  <select
                    required
                    value={entryForm.type}
                    onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="in">Inward (+ Add to stock)</option>
                    <option value="out">Outward (- Deduct from stock)</option>
                    <option value="adjustment">Adjustment (Stock correction)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={entryForm.quantity}
                    onChange={(e) => setEntryForm({ ...entryForm, quantity: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={entryForm.unit}
                    onChange={(e) => setEntryForm({ ...entryForm, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="Liter, kg, Pack..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={entryForm.purchasePrice}
                    onChange={(e) => setEntryForm({ ...entryForm, purchasePrice: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 55"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={entryForm.sellingPrice}
                    onChange={(e) => setEntryForm({ ...entryForm, sellingPrice: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier / Vendor</label>
                  <input
                    type="text"
                    value={entryForm.supplier}
                    onChange={(e) => setEntryForm({ ...entryForm, supplier: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="Supplier or Farm name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={entryForm.reason}
                    onChange={(e) => setEntryForm({ ...entryForm, reason: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Daily morning collection"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEntry}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 transition"
                >
                  {submittingEntry ? 'Saving...' : editingEntry ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
