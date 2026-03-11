import React from 'react';
import ProductCard from '../ui/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface RelatedProduct {
    id: number | string;
    name: string;
    price: string;
    category: string;
    image: string;
}

interface CompleteTheLookProps {
    products: RelatedProduct[];
}

const CompleteTheLook: React.FC<CompleteTheLookProps> = ({ products }) => {
    const { addToCart } = useCart();

    const handleQuickAdd = (product: RelatedProduct) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: 'S', // Default size
            quantity: 1
        });
    };

    return (
        <div className="py-20 border-t border-black/10">
            <div className="flex justify-between items-end mb-12">
                <h2 className="text-3xl font-serif uppercase tracking-tight">COMPLETE THE LOOK</h2>
                <div className="flex gap-2">
                    <button className="p-2 border border-black/10 hover:border-black transition-colors">
                        <ChevronLeft size={20} className="text-black/40" />
                    </button>
                    <button className="p-2 border border-black/10 hover:border-black transition-colors">
                        <ChevronRight size={20} className="text-black/40" />
                    </button>
                </div>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
                {products.map((product) => (
                    <div key={product.id} className="min-w-[280px] snap-start relative group">
                        <ProductCard
                            {...product}
                            className="shadow-none border border-transparent group-hover:border-light-gray"
                        />
                        {/* Overlay Add to cart button as seen in design */}
                        <button 
                            onClick={() => handleQuickAdd(product)}
                            className="absolute bottom-[110px] right-4 w-8 h-8 bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20"
                        >
                            <span className="text-xl font-light text-black/60">+</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompleteTheLook;
