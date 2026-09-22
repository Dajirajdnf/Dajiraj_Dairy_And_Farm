import { useState, useEffect } from 'react';
import { productAPI, customerAPI, retailBillAPI } from '../../services/api';
import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineMail,
  HiOutlinePrinter,
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineUser,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const RetailBillingPage = () => {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // POS State
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState([]);

  // Customer State
  const [customerType, setCustomerType] = useState('walkin'); // 'walkin' | 'registered'
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Bill Financials State
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success Modal State
  const [completedBill, setCompletedBill] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [emailingId, setEmailingId] = useState(null);

  // History State
  const [historyBills, setHistoryBills] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDate, setHistoryDate] = useState('');

  useEffect(() => {
    loadProductsAndCustomers();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadProductsAndCustomers = async () => {
    setLoadingProducts(true);
    try {
      const [prodsRes, custsRes] = await Promise.all([
        productAPI.getAll(),
        customerAPI.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(prodsRes.data.data || prodsRes.data || []);
      setCustomers(custsRes.data.data || custsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = {};
      if (historySearch) params.search = historySearch;
      if (historyDate) {
        params.startDate = historyDate;
        params.endDate = historyDate;
      }
      const res = await retailBillAPI.getAll(params);
      setHistoryBills(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load past bills');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Select registered customer handler
  const handleSelectCustomer = (custId) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c._id === custId);
    if (found) {
      setCustomerName(found.name || '');
      setCustomerPhone(found.phone || '');
      setCustomerEmail(found.email || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
    }
  };

  // Add item to cart
  const handleAddToCart = (product) => {
    const stockAvailable = product.currentStock !== undefined ? product.currentStock : (product.stock || 0);
    if (stockAvailable <= 0) {
      toast.error(`"${product.name}" is currently out of stock`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity + 1 > stockAvailable) {
          toast.error(`Cannot add more than available stock (${stockAvailable})`);
          return prev;
        }
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const price = product.sellingPrice ?? product.price ?? 0;
      return [
        ...prev,
        {
          product,
          name: product.name,
          unit: product.unit || 'Liter',
          price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    const product = products.find((p) => p._id === productId);
    const stockAvailable = product ? (product.currentStock !== undefined ? product.currentStock : (product.stock || 0)) : 99999;

    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    if (qty > stockAvailable) {
      toast.error(`Only ${stockAvailable} available in stock`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    setTaxRate(0);
    setPaidAmount('');
    setNotes('');
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const parsedDiscount = Math.max(0, parseFloat(discount) || 0);
  const parsedTaxRate = Math.max(0, parseFloat(taxRate) || 0);
  const taxableAmount = Math.max(0, subtotal - parsedDiscount);
  const taxAmount = Math.round(((taxableAmount * parsedTaxRate) / 100) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  // Categories list
  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Submit bill
  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Please add at least one product to the bill');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerType,
        customer: customerType === 'registered' ? selectedCustomerId || null : null,
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        customerEmail,
        items: cart.map((item) => ({
          product: item.product._id,
          name: item.name,
          unit: item.unit,
          quantity: item.quantity,
          price: item.price,
        })),
        discount: parsedDiscount,
        taxRate: parsedTaxRate,
        paymentMethod,
        paidAmount: paidAmount === '' ? grandTotal : Number(paidAmount),
        notes,
      };

      const res = await retailBillAPI.create(payload);
      const generatedBill = res.data.data;
      toast.success(`Bill ${generatedBill.billNumber} created!`);

      // Refresh product list so inventory counts update immediately
      loadProductsAndCustomers();

      // Show receipt modal
      setCompletedBill(generatedBill);
      setShowSuccessModal(true);

      // Reset cart and fields
      handleClearCart();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  // Download PDF helper
  const handleDownloadPdf = async (bill) => {
    setDownloadingId(bill._id);
    try {
      const res = await retailBillAPI.downloadPdf(bill._id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bill.billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      let errorMsg = 'Failed to generate PDF';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMsg = json.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setDownloadingId(null);
    }
  };

  // Email Bill helper
  const handleEmailBill = async (bill) => {
    const targetEmail = bill.customerEmail || bill.customer?.email;
    if (!targetEmail) {
      toast.error('No email address available for this customer');
      return;
    }

    setEmailingId(bill._id);
    try {
      const res = await retailBillAPI.sendEmail(bill._id);
      toast.success(res.data.message || 'Bill emailed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to email bill');
    } finally {
      setEmailingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Retail Billing & Counter Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Instant retail point-of-sale, automatic stock synchronization, and PDF bills</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            New Bill (POS)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Past Bills
          </button>
        </div>
      </div>

      {/* POS TAB */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Product Catalog & Quick Add (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs rounded-full capitalize font-medium transition whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No products found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const stock = p.currentStock !== undefined ? p.currentStock : (p.stock || 0);
                  const price = p.sellingPrice ?? p.price ?? 0;
                  const isOutOfStock = stock <= 0;

                  return (
                    <div
                      key={p._id}
                      onClick={() => !isOutOfStock && handleAddToCart(p)}
                      className={`border rounded-xl p-3.5 flex flex-col justify-between transition cursor-pointer ${
                        isOutOfStock
                          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-200 hover:border-emerald-500 hover:shadow-md bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isOutOfStock
                                ? 'bg-red-100 text-red-700'
                                : stock <= (p.minimumStock ?? p.minStockAlert ?? 5)
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {stock} {p.unit}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 capitalize mt-0.5">{p.category}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm font-extrabold text-emerald-700">₹{price}</span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                            isOutOfStock
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Cart & Checkout Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HiOutlineShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Current Bill</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                  {cart.length} items
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Customer Selector */}
            <div className="space-y-3 bg-gray-50/75 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                  <HiOutlineUser className="w-3.5 h-3.5 text-gray-500" /> Customer Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('walkin');
                      setCustomerName('Walk-in Customer');
                      setCustomerPhone('');
                      setCustomerEmail('');
                      setSelectedCustomerId('');
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      customerType === 'walkin'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('registered')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      customerType === 'registered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    Registered
                  </button>
                </div>
              </div>

              {customerType === 'registered' ? (
                <div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select registered customer...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <input
                type="email"
                placeholder="Email (for bill dispatch)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  Cart is empty. Click on any product on the left to add it.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h5 className="font-bold text-gray-900 truncate">{item.name}</h5>
                      <span className="text-gray-500 text-[11px]">
                        ₹{item.price} / {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                        >
                          <HiOutlineMinus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.product._id, e.target.value)}
                          className="w-12 text-center text-xs font-semibold py-1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                        >
                          <HiOutlinePlus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-gray-900 w-16 text-right">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.product._id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Checkout Form */}
            <form onSubmit={handleGenerateBill} className="space-y-3 pt-3 border-t border-gray-100">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500">Tax / GST (%)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl mt-2">
                  <span className="font-bold text-emerald-900 text-sm">Grand Total</span>
                  <span className="font-extrabold text-emerald-700 text-lg">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-gray-500">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Credit">Customer Credit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-gray-500">Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder={`₹${grandTotal.toFixed(2)}`}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Notes / instructions (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Generating Bill...' : `Complete & Print Bill (₹${grandTotal.toFixed(2)})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BILLING HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bill #, customer, phone..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadHistory()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="py-1.5 px-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              />

              <button
                onClick={loadHistory}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium transition"
              >
                <HiOutlineRefresh className="w-3.5 h-3.5" /> Filter
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Total {historyBills.length} retail bills
            </div>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : historyBills.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No retail bills found. Create your first bill using "New Bill (POS)".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Bill Number</th>
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Grand Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyBills.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition text-xs">
                      <td className="px-5 py-3.5 font-bold text-gray-900 font-mono">
                        {b.billNumber}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                        {new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-800">{b.customerName || 'Walk-in'}</div>
                        {b.customerPhone && <div className="text-[10px] text-gray-400">{b.customerPhone}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {b.items?.length || 0} product(s)
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {b.paymentMethod}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-emerald-700">
                        ₹{(b.grandTotal || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadPdf(b)}
                            disabled={downloadingId === b._id}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                            title="Download PDF"
                          >
                            <HiOutlineDownload className="w-4 h-4" />
                          </button>
                          {(b.customerEmail || b.customer?.email) && (
                            <button
                              onClick={() => handleEmailBill(b)}
                              disabled={emailingId === b._id}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                              title="Email Bill"
                            >
                              <HiOutlineMail className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bill Success / Receipt Modal */}
      {showSuccessModal && completedBill && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <HiOutlineCheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Bill Created Successfully!</h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">{completedBill.billNumber}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1.5 text-left border border-gray-100">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-gray-800">{completedBill.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold text-gray-800">{completedBill.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total Amount:</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ₹{(completedBill.grandTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(completedBill)}
                disabled={downloadingId === completedBill._id}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <HiOutlineDownload className="w-4 h-4" /> Download PDF
              </button>

              {(completedBill.customerEmail || completedBill.customer?.email) ? (
                <button
                  type="button"
                  onClick={() => handleEmailBill(completedBill)}
                  disabled={emailingId === completedBill._id}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <HiOutlineMail className="w-4 h-4" /> Email Customer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(completedBill)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
                >
                  <HiOutlinePrinter className="w-4 h-4" /> Print Receipt
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setCompletedBill(null);
              }}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
            >
              Start Next Customer Bill →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailBillingPage;
