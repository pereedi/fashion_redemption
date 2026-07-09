import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/ui/Breadcrumbs.tsx';
import FilterSidebar from '../components/ui/FilterSidebar.tsx';
import ProductGrid from '../sections/ProductGrid.tsx';
import Newsletter from '../sections/Newsletter.tsx';
import CollectionsNavbar from '../components/layout/CollectionsNavbar.tsx';
import SaleBanner from '../sections/SaleBanner.tsx';
import { useFacets } from '../hooks/useFacets.ts';

interface CollectionsPageProps {
    filter?: string;
}

const CollectionsPage: React.FC<CollectionsPageProps> = ({ filter: initialFilter }) => {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: [] as string[],
        size: [] as string[],
        color: [] as string[],
        minPrice: null as number | null,
        maxPrice: null as number | null,
        sort: 'newest',
        page: 1,
        filter: initialFilter || ''
    });

    const facets = useFacets({ filter: initialFilter || '' });

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ 
            ...prev, 
            ...newFilters, 
            page: newFilters.page !== undefined ? newFilters.page : 1 
        }));
    };

    return (
        <div className="bg-white min-h-screen">
            <CollectionsNavbar />
            {initialFilter === 'sale' && <SaleBanner />}
            <div className="container mx-auto px-4 md:px-8 py-8">
                <Breadcrumbs items={[{ label: 'HOME', href: '/' }, { label: initialFilter ? initialFilter.toUpperCase().replace('-', ' ') : 'SHOP ALL COLLECTIONS' }]} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-12 gap-4">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight uppercase">
                        {initialFilter === 'new' ? 'NEW ARRIVALS' : initialFilter === 'sale' ? 'SEASONAL SALE' : 'ALL COLLECTIONS'}
                    </h1>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-b md:border-none pb-4 md:pb-0">
                        <button
                            className="md:hidden flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter size={16} /> Filters
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-black/40 tracking-widest uppercase">Sort By:</span>
                            <select 
                                className="text-xs font-bold tracking-widest uppercase bg-transparent border-none outline-none cursor-pointer"
                                value={filters.sort}
                                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 relative">
                    <aside className="hidden md:block w-64 flex-shrink-0">
                            <FilterSidebar facets={facets} filters={filters} onFilterChange={handleFilterChange} />
                    </aside>

                    <main className="flex-grow">
                        <ProductGrid 
                            filters={filters} 
                            onPageChange={(page) => handleFilterChange({ page })}
                        />
                    </main>
                </div>
            </div>

            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-[70] md:hidden p-8 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="font-serif text-2xl uppercase">Filters</h2>
                                <button onClick={() => setIsMobileFilterOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                        <FilterSidebar facets={facets} filters={filters} onFilterChange={handleFilterChange} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Newsletter />
        </div>
    );
};

export default CollectionsPage;
