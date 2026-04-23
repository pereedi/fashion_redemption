import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  Box, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  Settings, 
  Users, 
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: Box },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Inventory', path: '/admin/inventory', icon: BarChart3 },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Fashion Redemption" 
              className="h-20 w-auto object-contain"
            />
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-red-50 text-luxury-red font-medium' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-luxury-red' : 'text-gray-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-red-50 rounded-md p-4 mb-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Access Level</p>
            <p className="text-sm font-semibold text-black">Administrator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
          >
            <LogOut size={20} className="text-gray-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  // Sync with URL if it changes externally
  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/admin/products?q=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-md"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center bg-gray-50 rounded-md px-3 py-2 w-96 border border-gray-200">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none w-full text-sm text-black placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-luxury-red rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right text-sm">
            <p className="font-medium text-black">{user?.name || 'Admin User'}</p>
            <p className="text-gray-500 text-xs">{user?.email || 'admin@luxury.com'}</p>
          </div>
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
