import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal }) => {
  const formattedSubtotal = `Esp ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
        <Link to="/checkout">
          <button className="w-full py-5 bg-luxury-red text-white text-[11px] font-bold tracking-[0.4em] uppercase rounded-sm flex items-center justify-center gap-3 hover:bg-black transition-all duration-500 shadow-lg shadow-luxury-red/10 group">
            PROCEED TO CHECKOUT 
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-500" />
          </button>
        </Link>
        <p className="text-center text-[9px] text-black/40 font-bold tracking-widest uppercase">
          COMPLIMENTARY SHIPPING & RETURNS ON ALL ORDERS.
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
