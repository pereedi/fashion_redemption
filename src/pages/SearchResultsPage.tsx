import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ProductGrid from '../sections/ProductGrid';
import Newsletter from '../sections/Newsletter';

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [filters, setFilters] = useState({
        sort: 'newest',
        page: 1
    });

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 md:px-8 py-32">
                <Breadcrumbs 
                    items={[
                        { label: 'HOME', href: '/' }, 
                        { label: 'SEARCH RESULTS' }
                    ]} 
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-12 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-serif tracking-tight uppercase">
                            Search Results
                        </h1>
                        <p className="text-black/40 text-xs font-bold tracking-widest uppercase">
                            Showing results for "{query}"
                        </p>
                    </div>

                    <div className="flex items-center gap-2 border-b border-light-gray pb-4 md:border-none md:pb-0">
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

                <div className="min-h-[400px]">
                    <ProductGrid 
                        filters={{ ...filters, q: query }} 
                        onPageChange={(page) => handleFilterChange({ page })}
                    />
                </div>
            </div>

            <Newsletter />
        </div>
    );
};

export default SearchResultsPage;
