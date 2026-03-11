import React from 'react';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeSection, setActiveSection }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'orders', label: 'ORDERS', icon: Package },
    { id: 'wishlist', label: 'WISHLIST', icon: Heart },
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 border-l-2 transition-all duration-500 ${
                isActive 
                  ? 'border-luxury-red bg-luxury-red/5 text-luxury-red' 
                  : 'border-transparent text-black/40 hover:bg-black/5'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-8 border-t border-black/5">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 text-black/40 hover:bg-black/5 hover:text-luxury-red transition-all duration-500"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">LOGOUT</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
