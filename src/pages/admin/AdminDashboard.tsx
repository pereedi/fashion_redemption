import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, ShoppingCart, Users, DollarSign, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import API_BASE_URL from '../../config/api';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [isRevenueVisible, setIsRevenueVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // Default PIN
      setIsRevenueVisible(true);
      setIsPinModalOpen(false);
      setPin('');
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold italic uppercase tracking-tight mb-2">WELCOME BACK, {user?.name?.toUpperCase() || 'ADMIN'}</h1>
        <p className="text-gray-500 text-sm">Here's what's happening with your Fashion Redemption store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1 flex items-center gap-2">
                Total Revenue 
                <button 
                  onClick={() => isRevenueVisible ? setIsRevenueVisible(false) : setIsPinModalOpen(true)}
                  className="text-luxury-red hover:text-black transition-colors"
                >
                  {isRevenueVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </p>
              <h3 className={`text-3xl font-bold transition-all duration-500 ${!isRevenueVisible ? 'blur-md select-none' : ''}`}>
                Esp {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-md">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-green-600 flex items-center gap-1">
            <TrendingUp size={12} /> +12% this month
          </p>
          <DollarSign className="absolute -bottom-4 -right-2 text-gray-50 w-24 h-24 transform -rotate-12" />
        </div>

        <div className="bg-luxury-red text-white p-6 rounded-lg shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-red-200 tracking-widest uppercase mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold">{stats.totalOrders}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-md">
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-red-100 flex items-center gap-1 relative z-10">
            All time
          </p>
          <div className="absolute top-0 right-0 p-4 -mr-8 -mt-8 opacity-20">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Active Users</p>
              <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-md">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
          <Link to="/admin/users" className="text-xs font-medium text-luxury-red hover:underline">
            View All Users
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Total Products</p>
              <h3 className="text-3xl font-bold">{stats.totalProducts}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-md">
              <img 
              src={logo} 
              alt="FR" 
              className="h-8 w-auto object-contain"
            />
            </div>
          </div>
          <Link to="/admin/products" className="text-xs font-medium text-luxury-red hover:underline">
            Manage Inventory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold uppercase tracking-tight">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-bold text-luxury-red hover:text-red-800 transition-colors">View All</Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Order ID</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Customer</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Status</th>
                  <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-500">No recent orders found.</td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium">#{String(order.id).padStart(6, '0')}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{order.customer_name || 'Guest'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                          order.status === 'delivered' || order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-right">Esp {Number(order.total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <h2 className="text-lg font-serif font-bold uppercase tracking-tight mb-4 text-luxury-red flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-luxury-red animate-pulse"></span>
            Low Stock Alerts
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {stats.lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">All products are adequately stocked.</div>
            ) : (
              stats.lowStockProducts.map((product: any) => (
                <div key={`${product.id}-${product.size}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-black line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-500">ID: {product.id} {product.size && `| Size: ${product.size}`}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${product.stock === 0 ? 'bg-red-100 text-luxury-red' : 'bg-orange-100 text-orange-800'}`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-6"
          >
            <div className="w-16 h-16 bg-luxury-red/10 text-luxury-red rounded-full flex items-center justify-center mx-auto">
              <Lock size={32} />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold uppercase tracking-tight">Security Check</h3>
              <p className="text-xs text-gray-500 mt-2">Enter your 4-digit PIN to view sensitive revenue data.</p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input 
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                autoFocus
                className="w-full text-center text-2xl tracking-[1em] py-4 border-2 border-gray-100 rounded-lg focus:border-luxury-red outline-none transition-all"
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-4 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-black text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-luxury-red transition-all"
                >
                  Verify
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
