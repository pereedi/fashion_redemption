import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const OrderConfirmationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8 max-w-lg"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-luxury-red/10 rounded-full flex items-center justify-center text-luxury-red">
              <CheckCircle size={40} strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-serif uppercase tracking-tight">Redemption Secured</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
              Your order has been placed successfully and is being processed.
            </p>
          </div>

          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/profile" 
              className="flex items-center justify-center gap-3 px-8 py-4 border border-black text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-500"
            >
              <ShoppingBag size={16} />
              View Orders
            </Link>
            <Link 
              to="/collections" 
              className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white text-[10px] font-bold tracking-widest uppercase hover:bg-luxury-red transition-all duration-500"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
