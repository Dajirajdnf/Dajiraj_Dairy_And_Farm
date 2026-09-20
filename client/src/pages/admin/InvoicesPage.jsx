import { useState, useEffect } from 'react';
import { invoiceAPI, customerAPI } from '../../services/api';
import { HiOutlineDocumentText, HiOutlineCurrencyRupee, HiOutlineSearch, HiOutlineFilter, HiOutlinePrinter, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlinePlus, HiOutlineDownload, HiOutlineMail } from 'react-icons/hi';
import toast from 'react-hot-toast';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Generate Invoice Modal
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genCustomerId, setGenCustomerId] = useState('');
  const [genMonth, setGenMonth] = useState(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  // View Invoice Modal
  const [viewInvoice, setViewInvoice] = useState(null);

  // Payment Record Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [emailingId, setEmailingId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordingPay, setRecordingPay] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [selectedStatus]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      const res = await invoiceAPI.getAll(params);
      setInvoices(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ limit: 200 });
      setCustomers(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    setGenerating(true);
    try {
      await invoiceAPI.generate({
        customerId: genCustomerId,
        billingMonth: Number(genMonth),
        billingYear: Number(genYear),
      });
      toast.success('Invoice generated successfully');
      setGenModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPayment = (inv) => {
    setPayInvoice(inv);
    setPaidAmount(inv.remainingAmount ?? inv.grandTotal);
    setPaymentMethod('UPI');
    setPaymentNotes('');
    setPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payInvoice) return;
    setRecordingPay(true);
    try {
      await invoiceAPI.updatePayment(payInvoice._id, {
        paidAmount: Number(paidAmount),
        paymentMethod,
        paymentNotes,
      });
      toast.success('Payment recorded successfully');
      setPayModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setRecordingPay(false);
    }
  };

  const handleDownloadPdf = async (inv) => {
    setDownloadingId(inv._id);
    try {
      const res = await invoiceAPI.downloadPdf(inv._id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (inv) => {
    if (!window.confirm(`Send invoice ${inv.invoiceNumber} to ${inv.customerSnapshot?.name}?`)) return;
    setEmailingId(inv._id);
    try {
      const res = await invoiceAPI.sendEmail(inv._id);
      toast.success(res.data.message || 'Invoice emailed successfully!');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setEmailingId(null);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber?.toLowerCase().includes(term) ||
      inv.customerSnapshot?.name?.toLowerCase().includes(term) ||
      inv.customer?.name?.toLowerCase().includes(term)
    );
  });

  // Calculate totals
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Generate monthly customer invoices, track collections, and print bills</p>
        </div>
        <button
          onClick={() => setGenModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition"
        >
          <HiOutlinePlus className="w-5 h-5" /> Generate Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Billed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalBilled.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{invoices.length} invoices generated</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Received via UPI / Cash / Bank</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Pending collection</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[220px]">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by invoice # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Void">Void</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filteredInvoices.length}</span> invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <HiOutlineDocumentText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm">No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Billing Period</th>
                  <th className="px-6 py-3.5">Milk Vol (L)</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => {
                  const custName = inv.customerSnapshot?.name || inv.customer?.name || 'Customer';
                  const custPhone = inv.customerSnapshot?.phone || inv.customer?.phone || '';
                  const totalLitres = ((inv.totalQuantityMl || 0) / 1000).toFixed(1);
                  const isPaid = inv.paymentStatus === 'Paid';
                  const isPartial = inv.paymentStatus === 'Partially Paid';

                  return (
                    <tr key={inv._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {inv.invoiceNumber}
                        <span className="block text-[11px] font-normal text-gray-400">
                          {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{custName}</div>
                        <div className="text-xs text-gray-400">{custPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {new Date(inv.billingPeriodStart).toLocaleDateString()} - {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {totalLitres} L
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">₹{inv.grandTotal}</div>
                        {inv.remainingAmount > 0 && (
                          <div className="text-[11px] text-red-500">₹{inv.remainingAmount} due</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPartial
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPaid ? <HiOutlineCheckCircle className="w-3.5 h-3.5" /> : <HiOutlineExclamationCircle className="w-3.5 h-3.5" />}
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.emailStatus === 'Sent'
                            ? 'bg-green-50 text-green-700'
                            : inv.emailStatus === 'Failed'
                            ? 'bg-red-50 text-red-700'
                            : inv.emailStatus === 'No Email'
                            ? 'bg-gray-50 text-gray-500'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {inv.emailStatus || 'Not Sent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setViewInvoice(inv)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(inv)}
                            disabled={downloadingId === inv._id}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium transition disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <HiOutlineDownload className="w-3.5 h-3.5" />
                            {downloadingId === inv._id ? '...' : 'PDF'}
                          </button>
                          <button
                            onClick={() => handleSendEmail(inv)}
                            disabled={emailingId === inv._id || inv.emailStatus === 'No Email'}
                            title={inv.emailStatus === 'No Email' ? 'Customer has no email' : 'Send email'}
                            className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg font-medium transition disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <HiOutlineMail className="w-3.5 h-3.5" />
                            {emailingId === inv._id ? '...' : 'Email'}
                          </button>
                          {!isPaid && (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg font-semibold transition"
                            >
                              Pay
                            </button>
                          )}
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

      {/* Generate Invoice Modal */}
      {genModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Generate Customer Invoice</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Customer *</label>
                <select
                  required
                  value={genCustomerId}
                  onChange={(e) => setGenCustomerId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Month</label>
                  <select
                    value={genMonth}
                    onChange={(e) => setGenMonth(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Year</label>
                  <input
                    type="number"
                    value={genYear}
                    onChange={(e) => setGenYear(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg">
                ℹ️ All delivered milk entries for this customer during the selected month will be automatically tallied into the invoice.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGenModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {generating ? 'Calculating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModalOpen && payInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
            <p className="text-xs text-gray-500">
              Invoice #{payInvoice.invoiceNumber} • {payInvoice.customerSnapshot?.name}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount Paid (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Full amount: ₹${payInvoice.remainingAmount || payInvoice.grandTotal}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Payment Notes / Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. UPI Ref: 1234567890"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPay}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {recordingPay ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl max-h-[90vh] overflow-y-auto space-y-6 print:p-0">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-emerald-800 tracking-wide">{viewInvoice.farmSnapshot?.name || viewInvoice.farmName || 'DAJIRAJ DAIRY & FARM'}</h2>
                <p className="text-xs text-gray-500">Pure Gir Cow Farm Fresh Milk & Dairy Delights</p>
                <p className="text-xs text-gray-400 mt-1">Phone: +91 98765 43210 • Email: info@dajirajdairy.com</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-800">INVOICE</span>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{viewInvoice.invoiceNumber}</p>
                <div className="flex flex-col items-end gap-1 mt-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewInvoice.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewInvoice.paymentStatus}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewInvoice.emailStatus === 'Sent'
                      ? 'bg-green-100 text-green-800'
                      : viewInvoice.emailStatus === 'Failed'
                      ? 'bg-red-100 text-red-800'
                      : viewInvoice.emailStatus === 'No Email'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Email: {viewInvoice.emailStatus || 'Not Sent'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
              <div>
                <p className="font-semibold text-gray-400 uppercase text-[10px]">Billed To:</p>
                <p className="font-bold text-gray-900 text-sm">{viewInvoice.customerSnapshot?.name}</p>
                <p>{viewInvoice.customerSnapshot?.phone}</p>
                <p className="text-gray-500">{viewInvoice.customerSnapshot?.address}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-400 uppercase text-[10px]">Billing Details:</p>
                <p>Invoice Date: <strong className="text-gray-900">{new Date(viewInvoice.invoiceDate || viewInvoice.createdAt).toLocaleDateString()}</strong></p>
                <p>Billing Period: <span className="font-medium text-gray-900">{new Date(viewInvoice.billingPeriodStart).toLocaleDateString()} - {new Date(viewInvoice.billingPeriodEnd).toLocaleDateString()}</span></p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Delivered Qty</th>
                    <th className="px-4 py-2.5">Rate / L</th>
                    <th className="px-4 py-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewInvoice.lineItems && viewInvoice.lineItems.length > 0 ? (
                    viewInvoice.lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{(item.quantityMl / 1000).toFixed(2)} L</td>
                        <td className="px-4 py-2 text-gray-600">₹{item.ratePer}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-900">₹{item.amount?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                        Monthly summary: {((viewInvoice.totalQuantityMl || 0) / 1000).toFixed(1)} Litres @ ₹{viewInvoice.rate}/L
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{viewInvoice.subtotal || viewInvoice.grandTotal}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5 text-sm">
                  <span>Grand Total:</span>
                  <span>₹{viewInvoice.grandTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>₹{viewInvoice.paidAmount || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600 border-t border-gray-100 pt-1">
                  <span>Balance Due:</span>
                  <span>₹{viewInvoice.remainingAmount || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 print:hidden">
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(viewInvoice)}
                disabled={downloadingId === viewInvoice._id}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
              >
                <HiOutlineDownload className="w-4 h-4" />
                {downloadingId === viewInvoice._id ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={() => handleSendEmail(viewInvoice)}
                disabled={emailingId === viewInvoice._id || viewInvoice.emailStatus === 'No Email'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
              >
                <HiOutlineMail className="w-4 h-4" />
                {emailingId === viewInvoice._id ? 'Sending...' : 'Send Email'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm"
              >
                <HiOutlinePrinter className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
