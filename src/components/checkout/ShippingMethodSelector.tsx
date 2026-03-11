import React from 'react';
import { motion } from 'framer-motion';

interface ShippingMethod {
  id: string;
  name: string;
  time: string;
  price: number;
}

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({ methods, selectedId, onSelect }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif uppercase tracking-tight">SHIPPING METHOD</h2>
      <div className="space-y-4">
        {methods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(method.id)}
            className={`cursor-pointer p-6 border rounded-sm flex items-center justify-between transition-all duration-300 ${
              selectedId === method.id 
                ? 'border-luxury-red bg-luxury-red/5' 
                : 'border-black/5 hover:border-black/20 bg-white'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                selectedId === method.id ? 'border-luxury-red' : 'border-black/20'
              }`}>
                {selectedId === method.id && <div className="w-2.5 h-2.5 rounded-full bg-luxury-red animate-scale-in" />}
              </div>
              <div>
                <h3 className="text-[13px] font-bold tracking-widest uppercase">{method.name}</h3>
                <p className="text-[11px] text-black/40 font-bold uppercase tracking-widest mt-1">{method.time}</p>
              </div>
            </div>
            <span className="text-[13px] font-serif font-bold text-luxury-red">
              {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ShippingMethodSelector;
