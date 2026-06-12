import { apiFetch } from '../config/apiClient';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import API_BASE_URL from '../config/api';

const NewArrivals: React.FC = () => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await apiFetch(`${API_BASE_URL}/api/products?filter=new`);
                if (!response.ok) {
                    throw new Error('Failed to retrieve new arrivals');
                }
                const data = await response.json();
                setProducts(data.data || []); // Get products from object
            } catch (err: any) {
                console.error('Error fetching new arrivals:', err);
                setError(err.message || 'Unable to load new arrivals');
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivals();
    }, []);

    if (loading) return (
        <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
        </div>
    );

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

                {error ? (
                    <div className="py-12 text-center border border-dashed border-luxury-red/20 rounded-sm">
                        <p className="text-[10px] font-bold tracking-widest text-luxury-red uppercase mb-2">Connection Issue</p>
                        <p className="text-xs text-black/60">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                id={product.id}
                                name={product.name}
                                price={`Esp ${Number(product.base_price || product.price).toLocaleString()}`}
                                basePrice={product.base_price || product.price}
                                image={product.image || product.images?.[0] || 'https://via.placeholder.com/400x500'}
                                category={product.category}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default NewArrivals;
