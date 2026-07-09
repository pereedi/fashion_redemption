import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

interface Facets {
    types: string[];
    colors: string[];
    sizes: string[];
    priceMin: number;
    priceMax: number;
}

interface FilterState {
    type: string[];
    size: string[];
    color: string[];
    minPrice: number | null;
    maxPrice: number | null;
    sort?: string;
    page?: number;
    filter?: string;
    q?: string;
    brand?: string;
}

interface FilterSidebarProps {
    facets?: Facets;
    filters: FilterState;
    onFilterChange?: (filters: Partial<FilterState>) => void;
}

const COLOR_HEX: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#C1121F',
    beige: '#F5F5DC',
    cream: '#FFFDD0',
    navy: '#1B1F3B',
    blue: '#2E5A88',
    denim: '#3B5A7A',
    green: '#2E5E3A',
    emerald: '#1F6F4A',
    burgundy: '#6B1F2A',
    charcoal: '#36454F',
    grey: '#808080',
    gray: '#808080',
    pink: '#E5A6B2',
    pastel: '#F4C2C2',
    lavender: '#B3A6D9',
    sand: '#D8C3A5',
    yellow: '#E0B84C',
    gold: '#C9A227',
    silver: '#C0C0C0',
    brown: '#6B4F3A'
};

function colorHex(name: string): string {
    const lower = name.toLowerCase();
    for (const [key, hex] of Object.entries(COLOR_HEX)) {
        if (lower.includes(key)) return hex;
    }
    let hash = 0;
    for (let i = 0; i < lower.length; i++) {
        hash = lower.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 45%, 55%)`;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ facets, filters, onFilterChange }) => {
    const types = facets?.types ?? [];
    const colors = facets?.colors ?? [];
    const sizes = facets?.sizes ?? [];
    const priceMin = facets?.priceMin ?? 0;
    const priceMax = facets?.priceMax ?? 0;

    const [price, setPrice] = useState<{ min: number; max: number } | null>(null);
    const effective = price ?? { min: priceMin, max: priceMax };

    const toggle = (key: 'type' | 'size' | 'color', value: string) => {
        const current = filters[key] || [];
        const exists = current.some((v) => v.toLowerCase() === value.toLowerCase());
        const next = exists
            ? current.filter((v) => v.toLowerCase() !== value.toLowerCase())
            : [...current, value];
        onFilterChange?.({ [key]: next });
    };

    const isActive = (key: 'type' | 'size' | 'color', value: string) =>
        (filters[key] || []).some((v: string) => v.toLowerCase() === value.toLowerCase());

    const commitPrice = () => {
        onFilterChange?.({ minPrice: effective.min, maxPrice: effective.max });
    };

    const setMin = (v: number) => setPrice({ min: Math.min(v, effective.max), max: effective.max });
    const setMax = (v: number) => setPrice({ min: effective.min, max: Math.max(v, effective.min) });

    const span = priceMax > priceMin ? priceMax - priceMin : 1;
    const leftPct = ((effective.min - priceMin) / span) * 100;
    const rightPct = ((priceMax - effective.max) / span) * 100;

    const clearAll = () => {
        setPrice(null);
        onFilterChange?.({ type: [], size: [], color: [], minPrice: null, maxPrice: null });
    };

    return (
        <div className="space-y-10 pb-20">
            <style>{`
                .kilo-range { position:absolute; top:0; left:0; width:100%; height:16px; margin:0; background:transparent; pointer-events:none; -webkit-appearance:none; appearance:none; }
                .kilo-range::-webkit-slider-thumb { -webkit-appearance:none; pointer-events:auto; width:14px; height:14px; border-radius:9999px; background:#C1121F; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,.3); border:none; }
                .kilo-range::-moz-range-thumb { pointer-events:auto; width:14px; height:14px; border:none; border-radius:9999px; background:#C1121F; cursor:pointer; }
                .kilo-range::-webkit-slider-runnable-track { background:transparent; }
                .kilo-range::-moz-range-track { background:transparent; }
            `}</style>

            {/* Category / Type */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">CATEGORY</h3>
                {types.length === 0 ? (
                    <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">No categories</p>
                ) : (
                    <ul className="space-y-4">
                        {types.map((type) => (
                            <li
                                key={type}
                                className="flex items-center gap-3 group cursor-pointer"
                                onClick={() => toggle('type', type)}
                            >
                                <div className={`w-4 h-4 border ${isActive('type', type) ? 'bg-luxury-red border-luxury-red' : 'border-black/20 group-hover:border-black'} flex items-center justify-center transition-all`}>
                                    {isActive('type', type) && <Check size={10} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className={`text-xs ${isActive('type', type) ? 'font-bold' : 'text-black/60'} uppercase tracking-wider`}>
                                    {type}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Size */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">SIZE</h3>
                {sizes.length === 0 ? (
                    <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">No sizes</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => toggle('size', size)}
                                className={`py-2 text-[10px] font-bold tracking-widest border transition-all ${isActive('size', size)
                                        ? 'bg-luxury-red border-luxury-red text-white'
                                        : 'bg-white border-light-gray text-black/60 hover:border-black'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Color */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">COLOR</h3>
                {colors.length === 0 ? (
                    <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">No colors</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => {
                            const active = isActive('color', color);
                            return (
                                <button
                                    key={color}
                                    onClick={() => toggle('color', color)}
                                    title={color}
                                    className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border rounded-full transition-all flex items-center gap-2 ${active
                                            ? 'border-luxury-red text-luxury-red'
                                            : 'border-light-gray text-black/60 hover:border-black'
                                        }`}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full border border-black/10"
                                        style={{ backgroundColor: colorHex(color) }}
                                    />
                                    {color}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 pb-2 border-b border-light-gray">PRICE RANGE</h3>
                <div className="relative pt-2 px-1">
                    <div className="h-0.5 bg-light-gray w-full relative">
                        <div
                            className="absolute h-full bg-luxury-red"
                            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        min={priceMin}
                        max={priceMax}
                        value={effective.min}
                        onChange={(e) => setMin(Number(e.target.value))}
                        onMouseUp={commitPrice}
                        onTouchEnd={commitPrice}
                        onKeyUp={commitPrice}
                        className="kilo-range"
                        aria-label="Minimum price"
                    />
                    <input
                        type="range"
                        min={priceMin}
                        max={priceMax}
                        value={effective.max}
                        onChange={(e) => setMax(Number(e.target.value))}
                        onMouseUp={commitPrice}
                        onTouchEnd={commitPrice}
                        onKeyUp={commitPrice}
                        className="kilo-range"
                        aria-label="Maximum price"
                    />
                    <div className="flex justify-between mt-6 text-[10px] font-bold tracking-widest text-black/40">
                        <span>Esp {effective.min.toLocaleString()}</span>
                        <span>Esp {effective.max.toLocaleString()}{effective.max >= priceMax ? '+' : ''}</span>
                    </div>
                </div>
            </div>

            <Button
                variant="primary"
                className="w-full !rounded-none mt-4 !py-4 font-bold tracking-[0.3em] text-[10px]"
                onClick={clearAll}
            >
                CLEAR ALL FILTERS
            </Button>
        </div>
    );
};

export default FilterSidebar;
