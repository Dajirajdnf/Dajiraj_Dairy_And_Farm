import { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineUserGroup, HiOutlinePhone, HiOutlineMail, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AVAILABLE_PERMISSIONS = [
  { id: 'customers', label: 'Customers' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'products', label: 'Products & Stock' },
  { id: 'invoices', label: 'Invoices & Billing' },
  { id: 'reports', label: 'Reports' },
  { id: 'inquiries', label: 'Inquiries' },
];

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active',
    permissions: ['customers', 'deliveries'],
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll();
      setStaffList(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'staff',
      status: 'active',
      permissions: ['customers', 'deliveries'],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      phone: staff.phone || '',
      email: staff.email || '',
      password: '',
      role: staff.role || 'staff',
      status: staff.status || 'active',
      permissions: staff.permissions || [],
    });
    setModalOpen(true);
  };

  const togglePermission = (permId) => {
    setFormData(prev => {
      const hasPerm = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: hasPerm
          ? prev.permissions.filter(p => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.password && editingStaff) {
        delete payload.password;
      }
      if (editingStaff) {
        await staffAPI.update(editingStaff._id, payload);
        toast.success('Staff member updated');
      } else {
        await staffAPI.create(payload);
        toast.success('Staff member created');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await staffAPI.delete(id);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.includes(searchTerm) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage administrative operators, roles, and granular permissions</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Staff Member
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total Staff: <span className="font-semibold text-gray-800">{filteredStaff.length}</span>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <HiOutlineUserGroup className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No staff members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((staff) => (
            <div key={staff._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-lg">
                      {staff.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{staff.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {staff.role}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          staff.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {staff.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    {staff.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(staff._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-2">
                    <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${staff.phone}`} className="hover:text-emerald-600 font-medium">{staff.phone}</a>
                  </div>
                  {staff.email && (
                    <div className="flex items-center gap-2">
                      <HiOutlineMail className="w-4 h-4 text-gray-400" />
                      <span>{staff.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions Tags */}
              <div className="mt-4 pt-3 border-t border-gray-50">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Permissions:
                </p>
                <div className="flex flex-wrap gap-1">
                  {staff.permissions && staff.permissions.length > 0 ? (
                    staff.permissions.map(perm => (
                      <span key={perm} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">
                        {perm}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">Full or default access</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
                    placeholder="Staff name"
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
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email / Username *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="staff@dajiraj.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Password {editingStaff ? '(leave blank to keep)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="staff">Staff Operator</option>
                    <option value="admin">Admin Manager</option>
                  </select>
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
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Module Permissions</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
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
                  {submitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
