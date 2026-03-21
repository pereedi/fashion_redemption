import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

import ProfileSidebar from '../components/profile/ProfileSidebar';
import OrderHistory from '../components/profile/OrderHistory';
import WishlistGrid from '../components/profile/WishlistGrid';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import API_BASE_URL from '../config/api';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const { wishlistItems } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        if (token) {
          const ordersRes = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData);
          }
        }

        // Fetch Wishlist Products
        const productsRes = await fetch(`${API_BASE_URL}/api/products`);
        if (productsRes.ok) {
          const data = await productsRes.json();
          const allProducts = data.products || [];
          const filtered = allProducts.filter((p: any) => wishlistItems.includes(String(p.id)));
          setWishlistProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, wishlistItems]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 pt-32 pb-32">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            <div className="mb-12">
              <h1 className="text-3xl font-serif uppercase tracking-tight mb-2">My Account</h1>
              <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">Welcome back, {user?.name}</p>
            </div>
            <ProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">Loading your data...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeSection === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12 animate-fade-in"
                  >
                    <section className="space-y-8">
                      <h2 className="text-xl font-serif uppercase tracking-tight border-b border-black/5 pb-4">Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Full Name</label>
                          <p className="text-sm font-medium">{user?.name}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Email Address</label>
                          <p className="text-sm font-medium">{user?.email}</p>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeSection === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 animate-fade-in"
                  >
                    <h2 className="text-xl font-serif uppercase tracking-tight border-b border-black/5 pb-4">Order History</h2>
                    <OrderHistory orders={orders} />
                  </motion.div>
                )}

                {activeSection === 'wishlist' && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 animate-fade-in"
                  >
                    <h2 className="text-xl font-serif uppercase tracking-tight border-b border-black/5 pb-4">Saved Wishlist</h2>
                    {wishlistProducts.length === 0 ? (
                      <div className="py-20 text-center border border-dashed border-black/10 rounded-sm">
                        <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">YOUR WISHLIST IS EMPTY</p>
                      </div>
                    ) : (
                      <WishlistGrid products={wishlistProducts} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>


    </div>
  );
};

export default ProfilePage;
