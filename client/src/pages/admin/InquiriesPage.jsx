import { useState, useEffect } from 'react';
import { inquiryAPI } from '../../services/api';
import { HiOutlineMail, HiOutlinePhone, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineClock, HiOutlineSearch, HiOutlineFilter, HiOutlineChatAlt } from 'react-icons/hi';
import toast from 'react-hot-toast';

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [statusVal, setStatusVal] = useState('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await inquiryAPI.getAll(params);
      setInquiries(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (inq) => {
    setEditingInquiry(inq);
    setStatusVal(inq.status || 'new');
    setAdminNotes(inq.notes || inq.adminNotes || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingInquiry) return;
    setSaving(true);
    try {
      await inquiryAPI.update(editingInquiry._id, {
        status: statusVal,
        notes: adminNotes,
      });
      toast.success('Inquiry updated successfully');
      setEditingInquiry(null);
      fetchInquiries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await inquiryAPI.delete(id);
      toast.success('Inquiry removed');
      fetchInquiries();
    } catch (err) {
      toast.error('Failed to delete inquiry');
    }
  };

  const filtered = inquiries.filter(i => {
    const term = searchTerm.toLowerCase();
    return (
      i.name?.toLowerCase().includes(term) ||
      i.phone?.includes(term) ||
      i.email?.toLowerCase().includes(term) ||
      i.message?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Inquiries & Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Review contact form submissions, order requests, and customer questions</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Inquiries: <span className="font-bold text-gray-900">{filtered.length}</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[220px]">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiry List Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <HiOutlineChatAlt className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No customer inquiries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inq) => {
            const isNew = inq.status === 'new';
            const isContacted = inq.status === 'contacted';
            const isConverted = inq.status === 'converted';

            return (
              <div key={inq._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{inq.name}</h3>
                    <span className="text-xs text-gray-400">
                      {new Date(inq.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    isNew ? 'bg-amber-100 text-amber-800' :
                    isContacted ? 'bg-blue-100 text-blue-800' :
                    isConverted ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {inq.status || 'new'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <a href={`tel:${inq.phone}`} className="flex items-center gap-1 hover:text-emerald-600 font-medium">
                    <HiOutlinePhone className="w-4 h-4 text-gray-400" />
                    {inq.phone}
                  </a>
                  {inq.email && (
                    <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-emerald-600">
                      <HiOutlineMail className="w-4 h-4 text-gray-400" />
                      {inq.email}
                    </a>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-700">
                  <p className="font-semibold text-gray-500 mb-1 text-[11px] uppercase tracking-wide">Customer Message:</p>
                  <p className="whitespace-pre-wrap">{inq.message || 'No message provided'}</p>
                </div>

                {(inq.notes || inq.adminNotes) && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg text-xs text-emerald-800">
                    <span className="font-semibold">Staff Notes: </span> {inq.notes || inq.adminNotes}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleOpenEdit(inq)}
                    className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    Update Status & Notes
                  </button>
                  <button
                    onClick={() => handleDelete(inq._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Status Modal */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Update Lead Status</h3>
            <p className="text-xs text-gray-500">
              Inquiry from <strong className="text-gray-800">{editingInquiry.name}</strong>
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted (Subscribed Customer)</option>
                  <option value="closed">Closed / Not Interested</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Internal Notes</label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Called customer, requested 1.5L daily delivery starting Monday"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesPage;
