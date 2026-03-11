import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onIncrease, onDecrease, className = '' }) => {
  return (
    <div className={`flex items-center border border-black/10 rounded-sm bg-light-gray/30 ${className}`}>
      <button 
        onClick={onDecrease}
        className="p-2 hover:bg-black/5 transition-colors disabled:opacity-30"
        disabled={quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-xs font-bold font-serif">{quantity}</span>
      <button 
        onClick={onIncrease}
        className="p-2 hover:bg-black/5 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default QuantitySelector;
