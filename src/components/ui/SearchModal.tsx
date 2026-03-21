import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import API_BASE_URL from '../../config/api';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const POPULAR_SEARCHES = ["Red Dress", "Denim Jacket", "Winter Coats", "Luxury Watches", "Evening Gowns"];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const saveSearch = (term: string) => {
        if (!term.trim()) return;
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleResultClick = (product: any) => {
        saveSearch(product.name);
        onClose();
        navigate(`/product/${product.id}`);
    };

    const handleViewAll = () => {
        saveSearch(query);
        onClose();
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleRecentClick = (term: string) => {
        setQuery(term);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden relative z-10"
                    >
                        {/* Search Input Area */}
                        <div className="p-6 border-b border-light-gray flex items-center gap-4">
                            <Search className="text-black/40" size={24} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for clothing, accessories, or brands"
                                className="flex-grow text-xl md:text-2xl font-serif outline-none placeholder:text-black/20"
                                onKeyDown={(e) => e.key === 'Enter' && handleViewAll()}
                            />
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-light-gray rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Results / Suggestion Area */}
                        <div className="max-h-[60vh] overflow-y-auto pb-6">
                            {isLoading ? (
                                <div className="p-12 flex flex-col items-center justify-center gap-4">
                                    <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">Searching...</span>
                                </div>
                            ) : query.trim().length >= 2 ? (
                                <>
                                    {/* Suggestions based on results */}
                                    {results.length > 0 && (
                                        <div className="px-6 py-4">
                                            <h4 className="text-[10px] font-bold tracking-widest text-black/30 uppercase mb-3">Suggestions</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.from(new Set(results.map(r => r.name))).slice(0, 3).map(suggestion => (
                                                    <button 
                                                        key={suggestion}
                                                        onClick={() => setQuery(suggestion)}
                                                        className="px-3 py-1 bg-f5 text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all rounded-full"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Results */}
                                    {results.length > 0 ? (
                                        <div className="divide-y divide-light-gray mt-2">
                                            <div className="px-6 py-2">
                                                <h4 className="text-[10px] font-bold tracking-widest text-black/30 uppercase">Products</h4>
                                            </div>
                                            {results.map((product: any) => (
                                                <div 
                                                    key={product.id}
                                                    onClick={() => handleResultClick(product)}
                                                    className="p-4 px-6 hover:bg-f5 flex gap-4 cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-16 h-20 bg-f5 overflow-hidden flex-shrink-0">
                                                        <img 
                                                            src={product.images[0]} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-1">
                                                        <span className="text-[10px] font-bold tracking-widest text-luxury-red uppercase">
                                                            {product.category}
                                                        </span>
                                                        <h3 className="text-sm font-bold tracking-tight uppercase group-hover:text-luxury-red transition-colors">
                                                            {product.name}
                                                        </h3>
                                                        <span className="text-xs text-black/60">{product.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={handleViewAll}
                                                className="w-full p-4 text-center text-[10px] font-bold tracking-widest uppercase text-black/40 hover:text-black hover:bg-f5 transition-all"
                                            >
                                                View all results
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <p className="text-[10px] font-bold tracking-widest text-black/30 uppercase mb-4">
                                                No products found for "{query}"
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    onClose();
                                                    navigate('/sales');
                                                }}
                                                className="!py-2"
                                            >
                                                Browse Collections
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="px-6 py-8 flex flex-col gap-10">
                                    {/* Recent Searches Header */}
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-[10px] font-bold tracking-widest text-black/30 uppercase">Recent Searches</h4>
                                                <button 
                                                    onClick={() => {
                                                        setRecentSearches([]);
                                                        localStorage.removeItem('recentSearches');
                                                    }}
                                                    className="text-[9px] font-bold tracking-widest text-luxury-red uppercase hover:underline"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button 
                                                        key={term}
                                                        onClick={() => handleRecentClick(term)}
                                                        className="px-4 py-2 border border-light-gray text-[10px] font-bold tracking-widest uppercase hover:border-black transition-all rounded-sm flex items-center gap-2 group"
                                                    >
                                                        <Search size={10} className="text-black/30 group-hover:text-black" />
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Popular Searches */}
                                    <div>
                                        <h4 className="text-[10px] font-bold tracking-widest text-black/30 uppercase mb-4">Popular Searches</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {POPULAR_SEARCHES.map(term => (
                                                <button 
                                                    key={term}
                                                    onClick={() => handleRecentClick(term)}
                                                    className="px-4 py-2 bg-f5 text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all rounded-sm"
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
