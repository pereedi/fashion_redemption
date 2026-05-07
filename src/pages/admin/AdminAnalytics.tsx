import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const AdminAnalytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>({
    salesReport: [],
    categoryReport: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('daily');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token, timeframe]);

  const COLORS = ['#C1121F', '#111827', '#64748b', '#94a3b8', '#cbd5e1'];

  if (loading && data.salesReport.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">Analytics overview</h1>
          <p className="text-sm text-gray-500">Deep dive into your store's performance metrics.</p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['daily', 'weekly', 'monthly', 'annual'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                timeframe === t 
                  ? 'bg-white text-luxury-red shadow-sm' 
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold uppercase tracking-tight">Revenue Trends</h2>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Total for Period</p>
              <p className="text-xl font-serif font-bold text-luxury-red">
                Esp {data.salesReport.reduce((acc: number, r: any) => acc + Number(r.revenue), 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.salesReport}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(value) => `Esp ${Number(value || 0).toLocaleString()}`}
                />
                <Tooltip 
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                  formatter={(value: any) => [`Esp ${Number(value || 0).toFixed(2)}`, 'REVENUE']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#C1121F" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#C1121F', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-serif font-bold uppercase tracking-tight mb-6">Revenue by Category</h2>
          <div className="h-80 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryReport}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="category"
                >
                  {data.categoryReport.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`Esp ${Number(value || 0).toFixed(2)}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 pr-4">
              {data.categoryReport.slice(0, 5).map((_entry: any, index: number) => (
                <div key={_entry.category} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{_entry.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Count Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-serif font-bold uppercase tracking-tight mb-6">Volume of Orders</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.salesReport}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [value || 0, 'ORDERS']}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#111827" 
                  radius={[4, 4, 0, 0]}
                  barSize={timeframe === 'daily' ? 40 : 60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
