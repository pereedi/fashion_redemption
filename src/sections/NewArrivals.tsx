import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';

const NewArrivals: React.FC = () => {
    const products = [
        {
            id: 1,
            name: "Alpine Low-Top",
            price: "$345.00",
            category: "FOOTWEAR",
            image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 2,
            name: "Vanguard Aviators",
            price: "$210.00",
            category: "EYEWEAR",
            image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 3,
            name: "Chronos Stealth Watch",
            price: "$1,850.00",
            category: "ACCESSORIES",
            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 4,
            name: "Prism Tote Bag",
            price: "$1,100.00",
            category: "BAGS",
            image: "https://images.unsplash.com/photo-1584917033904-49097e3f1782?auto=format&fit=crop&q=80&w=800",
        }
    ];

    return (
        <section className="py-20 bg-light-gray/50">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif">NEW ARRIVALS</h2>
                    <div className="flex gap-2">
                        <button className="p-2 border border-black/10 hover:border-black transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button className="p-2 border border-black/10 hover:border-black transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
