import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import API_BASE_URL from '../config/api';

const NewArrivals: React.FC = () => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products?filter=new`);
                const data = await response.json();
                setProducts(data.products || []); // Get products from object
            } catch (err) {
                console.error('Error fetching new arrivals:', err);
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

export default NewArrivals;
