import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface Variant {
  size: string;
  stock: number;
  color?: string;
  price_override?: number;
}

interface VariantEditorProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

const VariantEditor: React.FC<VariantEditorProps> = ({ variants, onChange }) => {
  const addVariant = () => {
    onChange([...variants, { size: '', stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold tracking-wide text-gray-400 uppercase">
          Product Variants & Inventory
        </label>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1 text-[10px] font-bold text-luxury-red hover:text-black uppercase tracking-widest transition-colors"
        >
          <Plus size={14} /> Add Size
        </button>
      </div>

      <div className="space-y-3">
        {variants.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400 italic">No variants added yet. Click "Add Size" to begin.</p>
          </div>
        )}
        
        {variants.map((variant, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-lg shadow-sm border border-gray-100 group animate-slide-in">
            <div className="flex-1 space-y-1 w-full">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Size</span>
              <input
                type="text"
                value={variant.size}
                placeholder="e.g. M, 42, XL"
                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-luxury-red transition-all"
              />
            </div>
            
            <div className="w-full sm:w-32 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Stock</span>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                className="w-full h-11 px-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-luxury-red transition-all"
                min="0"
              />
            </div>

            <div className="flex-1 space-y-1 w-full">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Color (Opt)</span>
              <input
                type="text"
                value={variant.color || ''}
                placeholder="Black, Red"
                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-luxury-red transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => removeVariant(index)}
              className="h-11 px-4 text-gray-300 hover:text-luxury-red transition-colors mb-[2px]"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="pt-2 text-right">
        <p className="text-[10px] text-gray-400 font-medium italic">
          Total Inventory: {variants.reduce((acc, v) => acc + (v.stock || 0), 0)} items
        </p>
      </div>
    </div>
  );
};

export default VariantEditor;
