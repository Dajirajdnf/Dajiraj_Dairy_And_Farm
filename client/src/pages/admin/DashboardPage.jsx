import { useState, useEffect } from 'react';
import { dashboardAPI, deliveryAPI } from '../../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineUsers, HiOutlineTruck, HiOutlineCube, HiOutlineCurrencyRupee, HiOutlineMail, HiOutlineExclamation } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardAPI.get(),
        dashboardAPI.getCharts(),
      ]);
      setStats(statsRes.data.data);
      setCharts(chartsRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDeliveries = async () => {
    try {
      const { data } = await deliveryAPI.generateToday();
      toast.success(data.message);
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate deliveries');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-28 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: HiOutlineUsers, color: 'bg-primary-50 text-primary-600' },
    { label: 'Active Customers', value: stats?.activeCustomers || 0, icon: HiOutlineUsers, color: 'bg-green-50 text-green-600' },
    { label: "Today's Expected", value: `${((stats?.todayExpectedMl || 0) / 1000).toFixed(1)} L`, icon: HiOutlineTruck, color: 'bg-blue-50 text-blue-600' },
    { label: "Today's Delivered", value: `${((stats?.todayDeliveredMl || 0) / 1000).toFixed(1)} L`, icon: HiOutlineTruck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Deliveries', value: stats?.pendingDeliveries || 0, icon: HiOutlineTruck, color: 'bg-amber-50 text-amber-600' },
    { label: 'Completed Deliveries', value: stats?.completedDeliveries || 0, icon: HiOutlineTruck, color: 'bg-teal-50 text-teal-600' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: HiOutlineCube, color: 'bg-purple-50 text-purple-600' },
    { label: 'Low Stock', value: stats?.lowStockProducts || 0, icon: HiOutlineExclamation, color: stats?.lowStockProducts > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600' },
    { label: 'Monthly Revenue', value: `₹${(stats?.currentMonthRevenue || 0).toLocaleString('en-IN')}`, icon: HiOutlineCurrencyRupee, color: 'bg-golden-50 text-golden-600' },
    { label: 'Pending Amount', value: `₹${(stats?.pendingInvoiceAmount || 0).toLocaleString('en-IN')}`, icon: HiOutlineCurrencyRupee, color: 'bg-orange-50 text-orange-600' },
    { label: 'New Inquiries', value: stats?.newInquiries || 0, icon: HiOutlineMail, color: stats?.newInquiries > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600' },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <button
          onClick={handleGenerateDeliveries}
          className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition shadow-sm"
        >
          Generate Today's Deliveries
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Delivery Chart */}
        {charts?.dailyDeliveries && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Milk Delivery (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.dailyDeliveries.map(d => ({...d, litres: (d.totalMl / 1000).toFixed(1)}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v} L`} />
                <Bar dataKey="litres" fill="#2d6a2e" radius={[4,4,0,0]} name="Litres" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue Chart */}
        {charts?.monthlyRevenue && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="revenue" stroke="#d4a843" strokeWidth={2.5} dot={{ r: 4, fill: '#d4a843' }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Delivery Status */}
        {charts?.todayStatus?.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Today's Delivery Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.todayStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="_id"
                  label={({ _id, count }) => `${_id}: ${count}`}
                >
                  {charts.todayStatus.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
