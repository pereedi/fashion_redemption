import React from 'react';
import ProductCard from '../components/ui/ProductCard';
import API_BASE_URL from '../config/api';

const TrendingCollections: React.FC = () => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Fetch 4 trending women products (not in new arrivals)
                const response = await fetch(`${API_BASE_URL}/api/products?filter=trending`);
                const data = await response.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error('Error fetching trending products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (loading) return null;

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
                    <a href="/sales" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-luxury-red hover:border-luxury-red transition-all">
                        VIEW ALL
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            id={product.id}
                            name={product.name}
                            price={`Esp ${Number(product.base_price).toLocaleString()}`}
                            basePrice={product.base_price}
                            image={product.images?.[0] || 'https://via.placeholder.com/400x500'}
                            category={product.category}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingCollections;
