import React from 'react';
import ProductCard from '../components/ui/ProductCard';

const TrendingCollections: React.FC = () => {
    const products = [
        {
            id: 1,
            name: "Obsidian Moto Jacket",
            price: "$1,250.00",
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 2,
            name: "Crimson Silk Gown",
            price: "$890.00",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 3,
            name: "Core Essential Tee",
            price: "$45.00",
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        },
        {
            id: 4,
            name: "Heritage Chelsea Boot",
            price: "$620.00",
            image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800",
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-[10px] text-luxury-red font-bold uppercase tracking-[0.3em] mb-2 block">
                            CURATED FOR YOU
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif">TRENDING COLLECTIONS</h2>
                    </div>
                    <a href="/collections" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-luxury-red hover:border-luxury-red transition-all">
                        VIEW ALL
                    </a>
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

export default TrendingCollections;
