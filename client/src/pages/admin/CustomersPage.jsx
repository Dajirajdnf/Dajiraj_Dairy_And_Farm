import { useState, useEffect } from 'react';
import { customerAPI, staffAPI, deliveryBoyAPI } from '../../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [staff, setStaff] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const emptyForm = { name: '', email: '', phone: '', address: '', googleMapsLink: '', dailyMilkQuantityMl: 1000, milkRate: 60, assignedStaff: '', assignedDeliveryBoy: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadCustomers(); loadUsers(); }, [search, pagination.page]);

  const loadCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll({ search, page: pagination.page, limit: 15 });
      setCustomers(data.data);
      setPagination(data.pagination);
    } catch (e) { toast.error('Failed to load customers'); } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      const [s, d] = await Promise.all([staffAPI.getAll({ limit: 100 }), deliveryBoyAPI.getAll({ limit: 100 })]);
      setStaff(s.data.data); setDeliveryBoys(d.data.data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, form);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(form);
        toast.success('Customer created successfully');
      }
      setShowForm(false); setEditingCustomer(null); setForm(emptyForm); loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setForm({
      name: customer.name, email: customer.email || '', phone: customer.phone, address: customer.address,
      googleMapsLink: customer.googleMapsLink || '', dailyMilkQuantityMl: customer.dailyMilkQuantityMl,
      milkRate: customer.milkRate, assignedStaff: customer.assignedStaff?._id || '',
      assignedDeliveryBoy: customer.assignedDeliveryBoy?._id || '', notes: customer.notes || '',
    });
    setEditingCustomer(customer); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this customer?')) return;
    try { await customerAPI.delete(id); toast.success('Customer deactivated'); loadCustomers(); }
    catch (e) { toast.error('Failed to deactivate customer'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={() => { setShowForm(true); setEditingCustomer(null); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition shadow-sm">
          <HiOutlinePlus size={18} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Phone', 'Daily Milk', 'Rate', 'Staff', 'Delivery Boy', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No customers found</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 font-medium text-primary-600">{(c.dailyMilkQuantityMl / 1000).toFixed(2)} L</td>
                    <td className="px-4 py-3 text-gray-600">₹{c.milkRate}/L</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.assignedStaff?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.assignedDeliveryBoy?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition">
                          <HiOutlinePencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
            <div className="flex gap-2">
              <button onClick={() => setPagination(p => ({...p, page: Math.max(1, p.page - 1)}))} disabled={pagination.page === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPagination(p => ({...p, page: Math.min(p.pages, p.page + 1)}))} disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm" placeholder="10-digit" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Google Maps Link</label>
                  <input type="url" value={form.googleMapsLink} onChange={(e) => setForm({...form, googleMapsLink: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                <textarea rows={2} value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Daily Milk (ml) *</label>
                  <input type="number" value={form.dailyMilkQuantityMl} onChange={(e) => setForm({...form, dailyMilkQuantityMl: parseInt(e.target.value) || 0})} min={0} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm" />
                  <p className="text-[10px] text-gray-400 mt-0.5">{(form.dailyMilkQuantityMl / 1000).toFixed(2)} Litres</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rate (₹/Litre) *</label>
                  <input type="number" value={form.milkRate} onChange={(e) => setForm({...form, milkRate: parseFloat(e.target.value) || 0})} min={0} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Staff</label>
                  <select value={form.assignedStaff} onChange={(e) => setForm({...form, assignedStaff: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm">
                    <option value="">Select Staff</option>
                    {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Delivery Boy</label>
                  <select value={form.assignedDeliveryBoy} onChange={(e) => setForm({...form, assignedDeliveryBoy: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm">
                    <option value="">Select Delivery Boy</option>
                    {deliveryBoys.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 outline-none text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition">
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingCustomer(null); }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
