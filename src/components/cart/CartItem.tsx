import React from 'react';
import { Trash2 } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../../context/CartContext';
import type { CartItem as CartItemType } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleIncrease = () => updateQuantity(item.id, item.size, item.color, item.quantity + 1);
  const handleDecrease = () => updateQuantity(item.id, item.size, item.color, item.quantity - 1);

  return (
    <div className="flex gap-4 py-6 border-b border-black/5 animate-fade-in group">
      <div className="w-24 h-32 flex-shrink-0 bg-light-gray/50 overflow-hidden rounded-sm">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
        />
      </div>

      <div className="flex-grow flex flex-col justify-between py-1">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold tracking-widest uppercase leading-tight line-clamp-1">{item.name}</h4>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">SIZE: {item.size}</span>
              {item.color && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">COLOR:</span>
                  <div 
                    className="w-2.5 h-2.5 rounded-full border border-black/10" 
                    style={{ backgroundColor: item.color.toLowerCase() }}
                  />
                  <span className="text-[9px] font-bold text-black/60 uppercase tracking-widest">{item.color}</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[13px] font-serif font-bold text-luxury-red">{item.price}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <QuantitySelector 
            quantity={item.quantity} 
            onIncrease={handleIncrease} 
            onDecrease={handleDecrease} 
          />
          <button 
            onClick={() => removeFromCart(item.id, item.size, item.color)}
            className="flex items-center gap-1.5 text-[9px] font-bold text-black/40 uppercase tracking-[0.2em] hover:text-luxury-red transition-all group/btn"
          >
            <Trash2 size={12} className="group-hover/btn:scale-120 transition-transform" />
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
