import React from 'react';
import ProductCard from '../components/ui/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
    category?: string;
    filters?: any;
    onPageChange?: (page: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ category, filters, onPageChange }) => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [pagination, setPagination] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    ...(category && { category }),
                    ...filters
                });
                const response = await fetch(`http://localhost:5000/api/products?${params}`);
                const data = await response.json();
                setProducts(data.products || []);
                setPagination(data);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [category, filters]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">Fetching Collection...</span>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-32 text-center border border-dashed border-black/10 rounded-sm">
                <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase">No products found matching your filters</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={`Esp ${Number(product.base_price).toLocaleString()}`}
                        basePrice={product.base_price}
                        image={product.images?.[0] || 'https://via.placeholder.com/400x500'}
                        category={product.category}
                        className="shadow-none border border-light-gray/50 hover:border-transparent"
                    />
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-10 border-t border-light-gray/50">
                    <button 
                        onClick={() => onPageChange?.(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-2 border border-light-gray hover:border-black transition-colors text-black/40 hover:text-black disabled:opacity-20"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {[...Array(pagination.pages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange?.(i + 1)}
                            className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all ${
                                pagination.currentPage === i + 1
                                    ? 'bg-luxury-red text-white'
                                    : 'bg-white border border-light-gray text-black/60 hover:border-black'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => onPageChange?.(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.pages}
                        className="p-2 border border-light-gray hover:border-black transition-colors text-black/40 hover:text-black disabled:opacity-20"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
