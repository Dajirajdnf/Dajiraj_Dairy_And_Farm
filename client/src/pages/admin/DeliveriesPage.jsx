import { useState, useEffect } from 'react';
import { deliveryAPI, deliveryBoyAPI, customerAPI } from '../../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiOutlineCalendar, HiOutlineFilter, HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineTruck, HiOutlineUser, HiOutlineSwitchVertical } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBoy, setSelectedBoy] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [generating, setGenerating] = useState(false);

  // Status update modal
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [newStatus, setNewStatus] = useState('delivered');
  const [newQty, setNewQty] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Route ordering
  const [activeTab, setActiveTab] = useState('deliveries'); // 'deliveries' | 'route'
  const [routeBoy, setRouteBoy] = useState('');
  const [routeCustomers, setRouteCustomers] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [selectedDate, selectedBoy, selectedStatus]);

  const fetchDeliveryBoys = async () => {
    try {
      const res = await deliveryBoyAPI.getAll();
      setDeliveryBoys(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching delivery boys', err);
    }
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (selectedBoy) params.deliveryBoy = selectedBoy;
      if (selectedStatus) params.status = selectedStatus;
      const res = await deliveryAPI.getAll(params);
      setDeliveries(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error loading deliveries', err);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToday = async () => {
    setGenerating(true);
    try {
      const res = await deliveryAPI.generateToday();
      toast.success(res.data.message || "Today's deliveries generated successfully!");
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate deliveries');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenStatusModal = (delivery) => {
    setEditingDelivery(delivery);
    setNewStatus(delivery.status);
    setNewQty(delivery.finalQuantityMl || delivery.baseQuantityMl || '');
    setNewNotes(delivery.notes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingDelivery) return;
    setSubmitting(true);
    try {
      await deliveryAPI.updateStatus(editingDelivery._id, {
        status: newStatus,
        finalQuantityMl: Number(newQty),
        notes: newNotes,
      });
      toast.success('Delivery updated successfully');
      setEditingDelivery(null);
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const loadRouteCustomers = async (deliveryBoyId) => {
    try {
      const res = await customerAPI.getAll({ deliveryBoy: deliveryBoyId, limit: 200, sort: 'deliveryOrder' });
      const customers = res.data.data || res.data || [];
      setRouteCustomers(customers.sort((a, b) => (a.deliveryOrder || 0) - (b.deliveryOrder || 0)));
    } catch (err) {
      toast.error('Failed to load customers');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(routeCustomers);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setRouteCustomers(items);
  };

  const saveRouteOrder = async () => {
    setSavingOrder(true);
    try {
      const orders = routeCustomers.map((c, idx) => ({ customerId: c._id, deliveryOrder: idx + 1 }));
      await customerAPI.reorder(orders);
      toast.success('Delivery route order saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  // Stats calculation
  const totalCount = deliveries.length;
  const deliveredCount = deliveries.filter(d => d.status === 'Delivered').length;
  const pendingCount = deliveries.filter(d => d.status === 'Pending').length;
  const totalExpectedLiters = deliveries.reduce((acc, d) => acc + (d.finalQuantityMl || d.baseQuantityMl || 0), 0) / 1000;
  const totalDeliveredLiters = deliveries.filter(d => d.status === 'Delivered').reduce((acc, d) => acc + (d.finalQuantityMl || 0), 0) / 1000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Milk Deliveries</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor daily schedules, track fulfillment, and manage delivery routes</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'deliveries' && (
            <button
              onClick={handleGenerateToday}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition duration-200 disabled:opacity-50"
            >
              <HiOutlineRefresh className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : "Generate Today's Deliveries"}
            </button>
          )}
          {activeTab === 'route' && routeCustomers.length > 0 && (
            <button
              onClick={saveRouteOrder}
              disabled={savingOrder}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition disabled:opacity-50"
            >
              {savingOrder ? 'Saving...' : 'Save Route Order'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === 'deliveries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Today's Deliveries
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition inline-flex items-center gap-1.5 ${
            activeTab === 'route'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <HiOutlineSwitchVertical className="w-4 h-4" /> Route Order
        </button>
      </div>

      {/* Deliveries Tab Content */}
      {activeTab === 'deliveries' && (
        <>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Deliveries</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalCount}</p>
          <p className="text-xs text-gray-500 mt-1">{totalExpectedLiters.toFixed(1)} L expected</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{deliveredCount}</p>
          <p className="text-xs text-gray-500 mt-1">{totalDeliveredLiters.toFixed(1)} L fulfilled</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">{totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0}% completed</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Completion</p>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-500 mt-1.5">{totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0}%</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <HiOutlineTruck className="w-5 h-5 text-gray-400" />
          <select
            value={selectedBoy}
            onChange={(e) => setSelectedBoy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Delivery Boys</option>
            {deliveryBoys.map(boy => (
              <option key={boy._id} value={boy._id}>{boy.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <HiOutlineFilter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Skipped">Skipped</option>
          </select>
        </div>

        <button
          onClick={fetchDeliveries}
          className="ml-auto inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-16 px-4">
            <HiOutlineTruck className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No deliveries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No deliveries recorded for this date. Click "Generate Today's Deliveries" to auto-create them from active customers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Delivery Boy</th>
                  <th className="px-6 py-3.5">Expected</th>
                  <th className="px-6 py-3.5">Delivered</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Time / Notes</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.map((delivery) => {
                  const customer = delivery.customer || {};
                  const boy = delivery.deliveryBoy || {};
                  return (
                    <tr key={delivery._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{customer.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                        {customer.address && (
                          <div className="text-xs text-gray-400 truncate max-w-xs">{customer.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <HiOutlineUser className="w-4 h-4 text-gray-400" />
                          <span>{boy.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {((delivery.baseQuantityMl || 0) / 1000).toFixed(2)} L
                        <span className="text-xs font-normal text-gray-400 block">{delivery.baseQuantityMl} ml</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">
                        {delivery.status === 'Delivered' ? (
                          <>
                            {((delivery.finalQuantityMl || 0) / 1000).toFixed(2)} L
                            <span className="text-xs font-normal text-gray-400 block">{delivery.finalQuantityMl} ml</span>
                          </>
                        ) : (
                          <span className="text-gray-400 font-normal">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          delivery.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : delivery.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {delivery.status === 'Delivered' && <HiOutlineCheckCircle className="w-3.5 h-3.5" />}
                          {delivery.status === 'Pending' && <HiOutlineClock className="w-3.5 h-3.5" />}
                          {delivery.status === 'Cancelled' && <HiOutlineXCircle className="w-3.5 h-3.5" />}
                          <span>{delivery.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {delivery.deliveredAt ? (
                          <div>{new Date(delivery.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        ) : null}
                        {delivery.notes && (
                          <div className="text-gray-400 italic max-w-xs truncate">{delivery.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenStatusModal(delivery)}
                          className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Edit Status
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
        </>
      )}

      {/* Route Order Tab */}
      {activeTab === 'route' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Select Delivery Boy to configure route</label>
            <select
              value={routeBoy}
              onChange={(e) => {
                setRouteBoy(e.target.value);
                if (e.target.value) loadRouteCustomers(e.target.value);
                else setRouteCustomers([]);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 bg-white w-full sm:w-80"
            >
              <option value="">-- Choose Delivery Boy --</option>
              {deliveryBoys.map(boy => (
                <option key={boy._id} value={boy._id}>{boy.name}</option>
              ))}
            </select>
          </div>

          {routeBoy && routeCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
              No customers assigned to this delivery boy.
            </div>
          )}

          {routeCustomers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Drag to reorder delivery sequence</p>
                <p className="text-xs text-gray-400">{routeCustomers.length} customers</p>
              </div>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="route-list">
                  {(provided) => (
                    <ul ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-100">
                      {routeCustomers.map((customer, index) => (
                        <Draggable key={customer._id} draggableId={customer._id} index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-4 px-5 py-3.5 transition ${
                                snapshot.isDragging ? 'bg-primary-50 shadow-lg' : 'hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-sm font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                              >
                                <HiOutlineSwitchVertical size={20} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.phone} · {customer.address}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-primary-600">
                                  {((customer.dailyMilkQuantityMl || 0) / 1000).toFixed(2)} L
                                </span>
                                <p className="text-xs text-gray-400">daily</p>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {editingDelivery && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Update Delivery Status</h3>
            <p className="text-xs text-gray-500">
              Customer: <span className="font-semibold text-gray-800">{editingDelivery.customer?.name}</span>
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Skipped">Skipped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Delivered Quantity (ml)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="50"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 1000 for 1 Litre"
                    required
                  />
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    = {(Number(newQty) / 1000).toFixed(2)} L
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Notes / Reason</label>
                <textarea
                  rows="2"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Optional delivery notes"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDelivery(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
