import React from 'react';
import { useCart } from '../../context/CartContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface OrderSummaryProps {
  onComplete: () => void;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  isSubmitting: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onComplete, shippingCost, tax, discount, total, isSubmitting }) => {
  const { cartItems, totalSubtotal } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white border border-black/5 rounded-sm p-8 space-y-8 sticky top-32">
      <h2 className="text-xl font-serif uppercase tracking-tight">ORDER SUMMARY</h2>

      {/* Item List */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        {cartItems.map((item, idx) => (
          <div key={idx} className="flex gap-4 group">
            <div className="w-16 h-20 bg-light-gray rounded-sm overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="flex-grow flex flex-col justify-between py-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[10px] font-bold tracking-widest uppercase leading-tight">{item.name}</h4>
                  <p className="text-[9px] text-black/40 font-bold uppercase mt-1 tracking-widest">
                    SIZE: {item.size} | QTY: {item.quantity}
                  </p>
                </div>
                <span className="text-[11px] font-serif font-bold text-luxury-red">{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="space-y-4 pt-8 border-t border-black/5">
        <label className="text-[9px] font-bold tracking-widest text-black/40 uppercase">PROMO CODE</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="REDEMPTION24"
            className="flex-grow px-4 py-3 bg-light-gray/30 border border-transparent focus:border-black/10 outline-none text-[10px] font-bold tracking-widest uppercase"
          />
          <button className="px-6 py-3 bg-black text-white text-[9px] font-bold tracking-widest uppercase hover:bg-black/90 transition-colors">
            APPLY
          </button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 pt-6 border-t border-black/5">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-black/40">
          <span>SUBTOTAL</span>
          <span className="text-black">{formatCurrency(totalSubtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-black/40">
          <span>SHIPPING</span>
          <span className="text-black">{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-luxury-red">
          <span>TAX (8%)</span>
          <span className="font-serif">+{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-green-600">
          <span>DISCOUNT (REDEMPTION24)</span>
          <span className="font-serif">-{formatCurrency(discount)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <span className="text-[12px] font-bold tracking-[0.2em] uppercase">TOTAL DUE</span>
          <div className="text-right">
            <span className="text-[24px] font-serif font-bold text-luxury-red block leading-none">
              {formatCurrency(total)}
            </span>
            <span className="text-[8px] font-bold text-black/30 tracking-widest uppercase">VAT INCLUDED WHERE APPLICABLE</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="space-y-4 pt-4">
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="w-full py-5 bg-luxury-red text-white text-[11px] font-bold tracking-[0.4em] uppercase rounded-sm flex items-center justify-center gap-3 hover:bg-black transition-all duration-500 shadow-xl shadow-luxury-red/20 group disabled:bg-black/50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'PROCESSING...' : 'COMPLETE ORDER'}
          {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-500" />}
        </button>
        <div className="flex items-center justify-center gap-2 text-[9px] text-black/40 font-bold tracking-widest uppercase">
          <ShieldCheck size={14} className="text-green-600" />
          SECURE SSL ENCRYPTED CHECKOUT
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
