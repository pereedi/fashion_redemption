import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface CartSummaryProps {
  subtotal: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal }) => {
  const { setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const formattedSubtotal = `Esp ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleCheckout = () => {
    setIsCartOpen(false);
    // Give the drawer exit animation time to complete before navigating
    setTimeout(() => navigate('/checkout'), 320);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 pt-6 border-t border-black/10">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-black/50">
          <span>SUBTOTAL</span>
          <span className="text-black">{formattedSubtotal}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-black/50">
          <span>SHIPPING</span>
          <span className="text-black/30">CALCULATED AT NEXT STEP</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-[12px] font-bold tracking-widest uppercase">TOTAL</span>
          <span className="text-[18px] font-serif font-bold text-luxury-red">{formattedSubtotal}</span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCheckout}
          className="w-full py-6 bg-luxury-red text-white text-[12px] font-bold tracking-[0.5em] uppercase rounded-sm flex items-center justify-center gap-4 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-xl shadow-luxury-red/20 group"
        >
          PROCEED TO CHECKOUT
          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
        </button>
        <p className="text-center text-[9px] text-black/40 font-bold tracking-widest uppercase">
          COMPLIMENTARY SHIPPING & RETURNS ON ALL ORDERS.
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
