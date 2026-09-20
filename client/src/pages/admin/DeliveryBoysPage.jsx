import { useState, useEffect } from 'react';
import { deliveryBoyAPI } from '../../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineTruck, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DeliveryBoysPage = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBoy, setEditingBoy] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    vehicleNumber: '',
    assignedArea: '',
    status: 'active',
  });

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    setLoading(true);
    try {
      const res = await deliveryBoyAPI.getAll();
      setDeliveryBoys(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load delivery boys');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBoy(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      vehicleNumber: '',
      assignedArea: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (boy) => {
    setEditingBoy(boy);
    setFormData({
      name: boy.name || '',
      phone: boy.phone || '',
      email: boy.email || '',
      password: '',
      vehicleNumber: boy.vehicleNumber || '',
      assignedArea: boy.assignedArea || '',
      status: boy.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.password && editingBoy) {
        delete payload.password;
      }
      if (editingBoy) {
        await deliveryBoyAPI.update(editingBoy._id, payload);
        toast.success('Delivery boy updated successfully');
      } else {
        await deliveryBoyAPI.create(payload);
        toast.success('Delivery boy added successfully');
      }
      setModalOpen(false);
      fetchDeliveryBoys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save delivery boy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this delivery boy?')) return;
    try {
      await deliveryBoyAPI.delete(id);
      toast.success('Delivery boy removed');
      fetchDeliveryBoys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete delivery boy');
    }
  };

  const filteredBoys = deliveryBoys.filter(boy =>
    boy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boy.phone?.includes(searchTerm) ||
    boy.assignedArea?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery Boys</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery personnel, assigned routes, and credentials</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Delivery Boy
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-gray-800">{filteredBoys.length}</span>
        </div>
      </div>

      {/* Grid of Delivery Boys */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredBoys.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <HiOutlineTruck className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No delivery boys found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBoys.map((boy) => (
            <div key={boy._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">
                    {boy.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{boy.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      boy.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {boy.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(boy)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(boy._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-600 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-2">
                  <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${boy.phone}`} className="hover:text-emerald-600 font-medium">{boy.phone}</a>
                </div>
                {boy.email && (
                  <div className="flex items-center gap-2">
                    <HiOutlineMail className="w-4 h-4 text-gray-400" />
                    <span>{boy.email}</span>
                  </div>
                )}
                {boy.vehicleNumber && (
                  <div className="flex items-center gap-2">
                    <HiOutlineTruck className="w-4 h-4 text-gray-400" />
                    <span>Vehicle: <strong className="text-gray-800">{boy.vehicleNumber}</strong></span>
                  </div>
                )}
                {boy.assignedArea && (
                  <div className="mt-2 bg-gray-50 px-2.5 py-1.5 rounded-lg text-gray-700 font-medium">
                    📍 Route/Area: {boy.assignedArea}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email / Username</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="driver@dajiraj.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Password {editingBoy ? '(leave blank to keep)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingBoy}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="GJ-01-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Assigned Area / Route</label>
                <input
                  type="text"
                  value={formData.assignedArea}
                  onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Ring Road, Sector 5-10"
                />
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
                  {submitting ? 'Saving...' : editingBoy ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoysPage;
