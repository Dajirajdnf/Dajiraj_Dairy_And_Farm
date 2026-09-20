import { useState, useEffect } from 'react';
import { deliveryAPI } from '../../services/api';
import { HiOutlineTruck, HiOutlineUsers } from 'react-icons/hi';
import { GiMilkCarton } from 'react-icons/gi';

const DeliveryDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryAPI.getMyDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse"></div>)}</div>;
  }

  const today = stats?.today || {};
  const monthly = stats?.monthly || {};

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Today's Progress */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
        <p className="text-sm text-primary-100 mb-1">Today's Progress</p>
        <div className="flex items-end justify-between mb-3">
          <span className="text-3xl font-bold">{today.completed || 0} / {today.totalAssigned || 0}</span>
          <span className="text-lg font-semibold text-golden-300">{today.completionPercentage || 0}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5">
          <div className="bg-golden-400 h-2.5 rounded-full transition-all" style={{ width: `${today.completionPercentage || 0}%` }}></div>
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <HiOutlineUsers className="mx-auto text-primary-400 mb-1" size={24} />
          <p className="text-2xl font-bold text-gray-900">{today.totalAssigned || 0}</p>
          <p className="text-xs text-gray-500">Assigned</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <HiOutlineTruck className="mx-auto text-green-400 mb-1" size={24} />
          <p className="text-2xl font-bold text-gray-900">{today.pending || 0}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <GiMilkCarton className="mx-auto text-blue-400 mb-1" size={24} />
          <p className="text-2xl font-bold text-gray-900">{((today.totalExpectedMl || 0) / 1000).toFixed(1)}</p>
          <p className="text-xs text-gray-500">Expected (L)</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <GiMilkCarton className="mx-auto text-golden-400 mb-1" size={24} />
          <p className="text-2xl font-bold text-gray-900">{((today.totalDeliveredMl || 0) / 1000).toFixed(1)}</p>
          <p className="text-xs text-gray-500">Delivered (L)</p>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">This Month</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xl font-bold text-primary-600">{monthly.totalDeliveries || 0}</p>
            <p className="text-xs text-gray-500">Total Deliveries</p>
          </div>
          <div>
            <p className="text-xl font-bold text-golden-600">{((monthly.totalMl || 0) / 1000).toFixed(1)} L</p>
            <p className="text-xs text-gray-500">Total Milk Delivered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
