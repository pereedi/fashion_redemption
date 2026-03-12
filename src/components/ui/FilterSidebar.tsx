import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

interface FilterSidebarProps {
    onFilterChange?: (filters: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
    const [selectedSize, setSelectedSize] = useState('S');
    const [selectedColor, setSelectedColor] = useState('Red');

    const categories = [
        { name: 'Dresses', count: 124, checked: true },
        { name: 'Jackets', count: 86, checked: false },
        { name: 'Tops', count: 210, checked: false },
        { name: 'Shoes', count: 54, checked: false },
    ];

    const sizes = ['XS', 'S', 'M', 'L', 'XL'];

    const colors = [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Red', hex: '#C1121F' },
        { name: 'Beige', hex: '#F5F5DC' },
    ];

    const brands = [
        { name: 'Aura Label', checked: false },
        { name: 'Elysian', checked: false },
        { name: 'Redemption Studio', checked: true },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Category */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">CATEGORY</h3>
                <ul className="space-y-4">
                    {categories.map((cat) => (
                        <li 
                            key={cat.name} 
                            className="flex items-center gap-3 group cursor-pointer"
                            onClick={() => onFilterChange?.({ type: cat.name.toLowerCase() })}
                        >
                            <div className={`w-4 h-4 border ${cat.checked ? 'bg-luxury-red border-luxury-red' : 'border-black/20 group-hover:border-black'} flex items-center justify-center transition-all`}>
                                {cat.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs ${cat.checked ? 'font-bold' : 'text-black/60'} uppercase tracking-wider`}>
                                {cat.name} <span className="text-black/30 font-normal">({cat.count})</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Size */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">SIZE</h3>
                <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => {
                                setSelectedSize(size);
                                onFilterChange?.({ size });
                            }}
                            className={`py-2 text-[10px] font-bold tracking-widest border transition-all ${selectedSize === size
                                    ? 'bg-luxury-red border-luxury-red text-white'
                                    : 'bg-white border-light-gray text-black/60 hover:border-black'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">COLOR</h3>
                <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => {
                                setSelectedColor(color.name);
                                onFilterChange?.({ color: color.name });
                            }}
                            className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center relative transition-all ${selectedColor === color.name ? 'ring-2 ring-luxury-red ring-offset-2 scale-110' : 'hover:scale-105'
                                }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        >
                            {color.name === 'White' && <div className="absolute inset-0 rounded-full border border-black/5" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">PRICE RANGE</h3>
                <div className="relative pt-6 px-1">
                    <div className="h-0.5 bg-light-gray w-full relative">
                        <div className="absolute top-1/2 left-[60%] -translate-y-1/2 w-3 h-3 bg-luxury-red rounded-full cursor-pointer shadow-md" />
                        <div className="absolute left-0 top-0 h-full bg-luxury-red w-[60%]" />
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold tracking-widest text-black/40">
                        <span>$0</span>
                        <span>$2,000+</span>
                    </div>
                </div>
            </div>

            {/* Brand */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">BRAND</h3>
                <ul className="space-y-4">
                    {brands.map((brand) => (
                        <li 
                            key={brand.name} 
                            className="flex items-center gap-3 group cursor-pointer"
                            onClick={() => onFilterChange?.({ brand: brand.name })}
                        >
                            <div className={`w-4 h-4 border ${brand.checked ? 'bg-luxury-red border-luxury-red' : 'border-black/20 group-hover:border-black'} flex items-center justify-center transition-all`}>
                                {brand.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-xs ${brand.checked ? 'font-bold' : 'text-black/60'} uppercase tracking-wider`}>
                                {brand.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <Button 
                variant="primary" 
                className="w-full !rounded-none mt-4 !py-4 font-bold tracking-[0.3em] text-[10px]"
                onClick={() => onFilterChange?.({ type: '', size: '', color: '', brand: '' })}
            >
                CLEAR ALL FILTERS
            </Button>
        </div>
    );
};

export default FilterSidebar;
