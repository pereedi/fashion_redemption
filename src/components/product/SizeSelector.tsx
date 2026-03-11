import React from 'react';

interface SizeSelectorProps {
    sizes: string[];
    selectedSize: string;
    onSelect: (size: string) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ sizes, selectedSize, onSelect }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-4">
                <span>SELECT SIZE</span>
                <button className="text-luxury-red hover:underline transition-all">Size Guide</button>
            </div>
            <div className="flex gap-3">
                {sizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => onSelect(size)}
                        className={`min-w-[50px] py-1 text-xs font-bold tracking-widest border transition-all ${selectedSize === size
                                ? 'border-luxury-red bg-luxury-red/5 text-luxury-red scale-110'
                                : 'border-black/10 text-black/40 hover:border-black hover:text-black'
                            }`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SizeSelector;
