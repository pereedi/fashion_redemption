import React, { useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/ui/Breadcrumbs.tsx';
import FilterSidebar from '../components/ui/FilterSidebar.tsx';
import ProductGrid from '../sections/ProductGrid.tsx';
import Newsletter from '../sections/Newsletter';
import CollectionsNavbar from '../components/layout/CollectionsNavbar';

const CollectionsPage: React.FC = () => {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    return (
        <div className="bg-white min-h-screen">
            <CollectionsNavbar />
            <div className="container mx-auto px-4 md:px-8 py-8">
                {/* Header Section */}
                <Breadcrumbs items={[{ label: 'HOME', href: '/' }, { label: 'SHOP ALL COLLECTIONS' }]} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-12 gap-4">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight uppercase">ALL COLLECTIONS</h1>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-b md:border-none pb-4 md:pb-0">
                        <button
                            className="md:hidden flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
                            onClick={() => setIsMobileFilterOpen(true)}
                        >
                            <Filter size={16} /> Filters
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-black/40 tracking-widest uppercase">Sort By:</span>
                            <div className="relative group">
                                <button className="text-xs font-bold tracking-widest uppercase flex items-center gap-1 border-b border-black pb-1">
                                    Newest Arrivals <ChevronDown size={14} />
                                </button>
                                {/* Dropdown would go here in a real app */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-12 relative">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <FilterSidebar />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-grow">
                        <ProductGrid />
                    </main>
                </div>
            </div>

            {/* Mobile Filter Overlay */}
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
                            <FilterSidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Newsletter />
        </div>
    );
};

export default CollectionsPage;
