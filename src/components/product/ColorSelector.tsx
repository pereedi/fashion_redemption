import React from 'react';

interface ColorSelectorProps {
    colors: string[];
    selectedColor: string;
    onSelect: (color: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ colors, selectedColor, onSelect }) => {
    if (!colors || colors.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-4">
                <span>SELECT COLOR</span>
            </div>
            <div className="flex flex-wrap gap-4">
                {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                        <button
                            key={color}
                            onClick={() => onSelect(color)}
                            className="group flex flex-col items-center gap-2 transition-all"
                        >
                            <div className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${
                                isSelected ? 'border-luxury-red scale-110' : 'border-transparent group-hover:border-black/20'
                            }`}>
                                <div 
                                    className="w-full h-full rounded-full border border-black/10 shadow-inner"
                                    style={{ 
                                        backgroundColor: color.toLowerCase(),
                                        // Specific handling for common color names to ensure they look good
                                        background: color.toLowerCase() === 'white' ? '#fff' : 
                                                   color.toLowerCase() === 'black' ? '#000' : 
                                                   color.toLowerCase().includes('denim') ? '#4B6B92' : 
                                                   color.toLowerCase().includes('navy') ? '#000080' : 
                                                   color.toLowerCase()
                                    }}
                                />
                            </div>
                            <span className={`text-[8px] font-bold tracking-widest uppercase transition-all ${
                                isSelected ? 'text-luxury-red' : 'text-black/40'
                            }`}>
                                {color}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ColorSelector;
