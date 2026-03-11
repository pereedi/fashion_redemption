import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, totalSubtotal, totalItems } = useCart();

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsCartOpen]);

  // Prevent scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all cursor-zoom-out"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[380px] md:w-[420px] bg-white z-[60] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-luxury-red text-[8px] font-bold text-white rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <h2 className="text-[13px] font-bold tracking-[0.2em] uppercase">Your Selection</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:rotate-90 transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto px-8 scrollbar-hide">
              {cartItems.length > 0 ? (
                <div className="flex flex-col">
                  {cartItems.map((item, idx) => (
                    <CartItem key={`${item.id}-${item.size}-${idx}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-light-gray rounded-full flex items-center justify-center text-black/20">
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase">Your bag is empty</h3>
                    <p className="text-[10px] text-black/40 font-bold tracking-widest uppercase mt-2">
                      Find your next redemption in our collection.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="px-8 py-4 border border-black text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-8 py-8 border-t border-black/5 bg-light-gray/20">
                <CartSummary subtotal={totalSubtotal} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
