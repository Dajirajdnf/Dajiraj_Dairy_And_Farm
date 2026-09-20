import { useState, useEffect } from 'react';
import { deliveryAPI } from '../../services/api';
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineCheck } from 'react-icons/hi';
import { FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TodayDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDeliveries(); }, []);

  const loadDeliveries = async () => {
    try {
      const { data } = await deliveryAPI.getToday();
      setDeliveries(data.data);
    } catch (e) { toast.error('Failed to load deliveries'); }
    finally { setLoading(false); }
  };

  const handleAdjust = async (id, action) => {
    try {
      const { data } = await deliveryAPI.adjustQuantity(id, action);
      toast.success(data.message);
      setDeliveries((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...data.data } : d))
      );
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to adjust'); }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this delivery as completed?')) return;
    try {
      const { data } = await deliveryAPI.markComplete(id);
      toast.success('Delivery marked as completed!');
      setDeliveries((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...data.data } : d))
      );
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to complete'); }
  };

  const completed = deliveries.filter((d) => d.status === 'Delivered').length;
  const total = deliveries.length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Today's Deliveries</h2>
          <span className="text-sm font-semibold text-primary-600">{completed}/{total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          {total > 0 ? `${Math.round((completed / total) * 100)}% Complete` : 'No deliveries today'}
        </p>
      </div>

      {/* Delivery Cards */}
      {deliveries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No deliveries assigned for today</p>
        </div>
      ) : (
        deliveries.map((delivery) => (
          <div
            key={delivery._id}
            className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
              delivery.status === 'Delivered'
                ? 'border-l-green-500 opacity-75'
                : 'border-l-primary-500'
            }`}
          >
            <div className="p-4">
              {/* Customer Info */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{delivery.customer?.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{delivery.customer?.address}</p>
                </div>
                {delivery.status === 'Delivered' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                    <HiOutlineCheck size={14} /> Done
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mb-4">
                <a href={`tel:${delivery.customer?.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                  <HiOutlinePhone size={14} /> Call
                </a>
                {delivery.customer?.googleMapsLink && (
                  <a href={delivery.customer.googleMapsLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                    <HiOutlineLocationMarker size={14} /> Map
                  </a>
                )}
              </div>

              {/* Quantity Controls */}
              {delivery.status !== 'Delivered' ? (
                <>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => handleAdjust(delivery._id, 'decrease')}
                      className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-100 active:scale-95 transition text-2xl font-bold shadow-sm"
                    >
                      <FiMinus size={24} />
                    </button>

                    <div className="text-center min-w-[120px]">
                      <p className="text-3xl font-bold text-gray-900">
                        {(delivery.finalQuantityMl / 1000).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Litres</p>
                      {delivery.adjustmentMl !== 0 && (
                        <p className={`text-xs font-medium mt-0.5 ${delivery.adjustmentMl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {delivery.adjustmentMl > 0 ? '+' : ''}{delivery.adjustmentMl} ml
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleAdjust(delivery._id, 'increase')}
                      className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center hover:bg-green-100 active:scale-95 transition text-2xl font-bold shadow-sm"
                    >
                      <FiPlus size={24} />
                    </button>
                  </div>

                  {/* Mark Delivered */}
                  <button
                    onClick={() => handleComplete(delivery._id)}
                    className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 active:scale-[0.98] transition shadow-md text-sm"
                  >
                    ✅ Delivery Done
                  </button>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-green-600 font-medium">
                    Delivered: {(delivery.finalQuantityMl / 1000).toFixed(2)} L
                  </p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TodayDeliveriesPage;
