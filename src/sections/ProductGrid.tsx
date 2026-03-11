import React from 'react';
import ProductCard from '../components/ui/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductGrid: React.FC = () => {
    const products = [
        {
            id: 1,
            name: "Crimson Silk Gala Gown",
            price: "$890.00",
            category: "REDEMPTION STUDIO",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 2,
            name: "Sculpted Minimalist Blazer",
            price: "$1,250.00",
            category: "ELYSIAN",
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 3,
            name: "Asymmetric Mesh Top",
            price: "$420.00",
            category: "REDEMPTION STUDIO",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 4,
            name: "Cobalt Leather Stiletto",
            price: "$675.00",
            category: "AURA LABEL",
            image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 5,
            name: "Onyx Evening Slit Dress",
            price: "$980.00",
            category: "REDEMPTION STUDIO",
            image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 6,
            name: "Architectural Cloud Dress",
            price: "$1,450.00",
            category: "ELYSIAN",
            image: "https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=800",
        }
    ];

    return (
        <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        {...product}
                        className="shadow-none border border-light-gray/50 hover:border-transparent"
                    />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 pt-10 border-t border-light-gray/50">
                <button className="p-2 border border-light-gray hover:border-black transition-colors text-black/40 hover:text-black">
                    <ChevronLeft size={16} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-luxury-red text-white text-xs font-bold">1</button>
                <button className="w-10 h-10 flex items-center justify-center bg-white border border-light-gray text-black/60 text-xs font-bold hover:border-black transition-colors">2</button>
                <button className="w-10 h-10 flex items-center justify-center bg-white border border-light-gray text-black/60 text-xs font-bold hover:border-black transition-colors">3</button>
                <button className="p-2 border border-light-gray hover:border-black transition-colors text-black/40 hover:text-black">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ProductGrid;
