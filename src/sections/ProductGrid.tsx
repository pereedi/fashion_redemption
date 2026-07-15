import { apiFetch } from '../config/apiClient';
import React from 'react';
import ProductCard from '../components/ui/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../config/api';

type PageItem = number | '…';

function getPageItems(totalPages: number, current: number): PageItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: PageItem[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    if (start > 2) items.push('…');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push('…');
    items.push(totalPages);
    return items;
}

interface ProductGridProps {
    category?: string;
    filters?: any;
    onPageChange?: (page: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ category, filters, onPageChange }) => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [pagination, setPagination] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (category) params.set('category', category);

                const f: Record<string, unknown> = filters ?? {};

                const arrayKeys = ['type', 'size', 'color'];
                for (const key of arrayKeys) {
                    const value = f[key];
                    if (Array.isArray(value) && value.length > 0) {
                        params.set(key, (value as string[]).join(','));
                    }
                }

                const scalarKeys = ['sort', 'page', 'filter', 'q', 'minPrice', 'maxPrice', 'brand'];
                for (const key of scalarKeys) {
                    const value = f[key];
                    if (value !== undefined && value !== null && value !== '') {
                        params.set(key, String(value));
                    }
                }

                const response = await apiFetch(`${API_BASE_URL}/api/products?${params}`);
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                const data = await response.json();
                setProducts(data.data || []);
                setPagination(data.pagination || null);
            } catch (err: any) {
                console.error('Failed to fetch products:', err);
                setError(err.message || 'Unable to load products. Please check your connection.');
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

    if (error) {
        return (
            <div className="py-32 text-center border border-dashed border-luxury-red/20 rounded-sm">
                <p className="text-[10px] font-bold tracking-widest text-luxury-red uppercase mb-2">Connection Issue</p>
                <p className="text-xs text-black/60">{error}</p>
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
                        price={`Esp ${Number(product.base_price || product.price).toLocaleString()}`}
                        basePrice={product.base_price || product.price}
                        image={product.image || product.images?.[0] || 'https://via.placeholder.com/400x500'}
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
                    
                    {getPageItems(pagination.pages, pagination.currentPage).map((item, idx) =>
                        item === '…' ? (
                            <span
                                key={`gap-${idx}`}
                                className="w-10 h-10 flex items-center justify-center text-xs text-black/30"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => onPageChange?.(item)}
                                className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all ${
                                    pagination.currentPage === item
                                        ? 'bg-luxury-red text-white'
                                        : 'bg-white border border-light-gray text-black/60 hover:border-black'
                                }`}
                            >
                                {item}
                            </button>
                        )
                    )}

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
