import { useState, useEffect } from 'react';
import { deliveryAPI } from '../../services/api';
import { HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineTruck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DeliveryHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(
    new Date(Date.now() - 86400000).toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchHistory();
  }, [filterDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getAll({ date: filterDate });
      setHistory(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load past deliveries');
    } finally {
      setLoading(false);
    }
  };

  const deliveredCount = history.filter(h => h.status === 'Delivered' || h.status === 'delivered').length;
  const totalLitres = history.reduce((sum, h) => sum + ((h.deliveredQuantity || h.finalQuantityMl || 0) / 1000), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Delivery History</h1>
        <p className="text-xs text-gray-500">Review past deliveries by date</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HiOutlineCalendar className="text-gray-400 w-5 h-5" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Fulfilled: <strong>{deliveredCount}/{history.length}</strong></span>
          <span className="text-xs text-emerald-600 font-bold">{totalLitres.toFixed(1)} Litres</span>
        </div>
      </div>

      {/* List of deliveries */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
          <HiOutlineTruck className="w-10 h-10 mx-auto mb-2 stroke-1" />
          <p className="text-sm">No delivery records found for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => {
            const customer = item.customer || {};
            const isDelivered = item.status === 'Delivered' || item.status === 'delivered';
            const qtyL = ((item.deliveredQuantity || item.finalQuantityMl || item.expectedQuantity || 0) / 1000).toFixed(2);

            return (
              <div key={item._id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between border-l-4 border-l-gray-200">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{customer.name || 'Customer'}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{customer.address}</p>
                  <span className="text-[11px] text-gray-400">
                    {item.deliveredAt ? new Date(item.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-900 text-base">{qtyL} L</span>
                  <div>
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isDelivered ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isDelivered ? <HiOutlineCheckCircle className="w-3 h-3" /> : <HiOutlineClock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistoryPage;
