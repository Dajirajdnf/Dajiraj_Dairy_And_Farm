import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineChartBar, HiOutlineCurrencyRupee, HiOutlineTruck, HiOutlineUsers, HiOutlineCube, HiOutlineCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('milk');
  const [loading, setLoading] = useState(false);

  // Data states
  const [milkData, setMilkData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [customerReport, setCustomerReport] = useState(null);
  const [deliveryReport, setDeliveryReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);

  // Date filters
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadCurrentTabData();
  }, [activeTab, period]);

  const loadCurrentTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'milk') {
        const res = await reportAPI.milk({ period });
        setMilkData(res.data.data || []);
      } else if (activeTab === 'revenue') {
        const res = await reportAPI.revenue({ period });
        setRevenueData(res.data.data || []);
      } else if (activeTab === 'customers') {
        const res = await reportAPI.customers();
        setCustomerReport(res.data.data || null);
      } else if (activeTab === 'delivery') {
        const res = await reportAPI.delivery();
        setDeliveryReport(res.data.data || null);
      } else if (activeTab === 'stock') {
        const res = await reportAPI.stock();
        setStockReport(res.data.data || null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Deep insights into milk production, revenue realization, customer subscriptions, and logistics</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('milk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'milk'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <HiOutlineChartBar className="w-4 h-4" /> Milk Distribution
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'revenue'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <HiOutlineCurrencyRupee className="w-4 h-4" /> Revenue & Invoices
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'customers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <HiOutlineUsers className="w-4 h-4" /> Customer Base
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'delivery'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <HiOutlineTruck className="w-4 h-4" /> Delivery Boys & Routes
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'stock'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <HiOutlineCube className="w-4 h-4" /> Stock & Movement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* MILK REPORT TAB */}
          {activeTab === 'milk' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-sm font-semibold text-gray-700">Time Interval:</span>
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                        period === p ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Delivered Volume Trend (Litres)</h3>
                {milkData.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-sm">No delivery records found for the period.</p>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={milkData.map(d => ({ date: d._id, litres: (d.totalFinalMl || 0) / 1000, deliveries: d.totalDelivered }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="litres" name="Litres Delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="deliveries" name="Successful Drops" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REVENUE REPORT TAB */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Revenue vs Collection Trend (₹)</h3>
                {revenueData.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-sm">No revenue data available yet.</p>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData.map(d => ({ date: d._id, Total: d.totalRevenue, Collected: d.totalPaid, Due: d.totalPending }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Collected" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Due" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CUSTOMERS REPORT TAB */}
          {activeTab === 'customers' && customerReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Customers</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{customerReport.activeCustomers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">New This Month</p>
                  <p className="text-3xl font-black text-blue-600 mt-1">{customerReport.newCustomers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inactive / Paused</p>
                  <p className="text-3xl font-black text-gray-500 mt-1">{customerReport.inactiveCustomers}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5">
                <h3 className="font-bold text-gray-900 mb-3">Top Customers by Daily Consumption</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Customer</th>
                        <th className="px-4 py-2.5">Phone</th>
                        <th className="px-4 py-2.5">Daily Volume</th>
                        <th className="px-4 py-2.5">Rate / L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {(customerReport.customerMilk || []).slice(0, 10).map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                          <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">
                            {((c.dailyMilkQuantityMl || 0) / 1000).toFixed(2)} Litres
                          </td>
                          <td className="px-4 py-3 text-gray-600">₹{c.milkRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DELIVERY REPORT TAB */}
          {activeTab === 'delivery' && deliveryReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Delivery Boy Performance</h3>
                  <div className="space-y-4">
                    {(deliveryReport.byDeliveryBoy || []).map((boy, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-800">
                          <span>{boy.name}</span>
                          <span>{boy.totalDelivered} / {boy.totalDeliveries} delivered</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${boy.totalDeliveries > 0 ? (boy.totalDelivered / boy.totalDeliveries) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-gray-500 text-right">
                          {((boy.totalMl || 0) / 1000).toFixed(1)} Litres fulfilled
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                  <h3 className="font-bold text-gray-900 mb-4 self-start">Delivery Status Breakdown</h3>
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(deliveryReport.byStatus || []).map(s => ({ name: s._id, value: s.count }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {(deliveryReport.byStatus || []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STOCK REPORT TAB */}
          {activeTab === 'stock' && stockReport && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Recent Stock Movements</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(stockReport.recentMovements || []).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900">{m.product?.name || 'Product'}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {m.type === 'in' ? '+' : '-'}{m.quantity}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{m.reason}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
