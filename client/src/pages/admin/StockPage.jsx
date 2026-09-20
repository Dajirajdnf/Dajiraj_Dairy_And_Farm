import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { HiOutlineCube, HiOutlineArrowSmUp, HiOutlineArrowSmDown, HiOutlineExclamation, HiOutlineClock, HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const StockPage = () => {
  const [products, setProducts] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Quick adjust form state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [adjType, setAdjType] = useState('in');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;
    setSubmitting(true);
    try {
      await productAPI.adjustStock(activeProduct._id, {
        type: adjType,
        quantity: Number(adjQty),
        reason: adjReason,
      });
      toast.success('Stock adjusted successfully');
      setModalOpen(false);
      await loadData();
      if (selectedProduct && selectedProduct._id === activeProduct._id) {
        viewHistory(activeProduct);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
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
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Low Stock Banner if any */}
      {lowStockList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <HiOutlineExclamation className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800">Low Stock Alert! ({lowStockList.length} items)</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {lowStockList.map(item => (
                <span key={item._id} className="inline-flex items-center gap-1 bg-white border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-full font-medium">
                  {item.name}: <strong className="text-red-600">{item.stock} {item.unit}</strong> left (Alert at {item.minStockAlert})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stock Overview Table & History Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Products Inventory Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Current Stock Levels</h3>
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
                    const isLow = p.stock <= (p.minStockAlert || 5);
                    const isSelected = selectedProduct?._id === p._id;
                    return (
                      <tr
                        key={p._id}
                        onClick={() => viewHistory(p)}
                        className={`cursor-pointer transition ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50/50'}`}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-xs capitalize text-gray-500">
                          {p.category}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          <span className={isLow ? 'text-red-600 font-extrabold' : 'text-emerald-700'}>
                            {p.stock} {p.unit}s
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          min {p.minStockAlert}
                        </td>
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
                    <span className={`p-1 rounded-full ${h.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
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

      {/* Adjust Modal */}
      {modalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Adjust Stock</h3>
            <p className="text-xs text-gray-500">
              Product: <span className="font-semibold text-gray-800">{activeProduct.name}</span> (Current: {activeProduct.stock} {activeProduct.unit}s)
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
                  min="1"
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
                  {submitting ? 'Applying...' : 'Confirm'}
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
