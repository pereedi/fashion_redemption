import React, { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Newsletter from '../sections/Newsletter';
import Navbar from '../components/layout/Navbar';
import { ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import WishlistGrid from '../components/profile/WishlistGrid';

const WishlistPage: React.FC = () => {
    const { wishlistItems } = useWishlist();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                const allProducts = await response.json();
                // Filter products that are in the wishlistItems array
                const filtered = allProducts.filter((p: any) => wishlistItems.includes(String(p.id)));
                setProducts(filtered);
            } catch (err) {
                console.error('Failed to fetch wishlist products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [wishlistItems]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center font-serif uppercase tracking-widest gap-4">
                <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
                <span>LOADING WISHLIST...</span>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 md:px-8 py-8">
                <Breadcrumbs items={[{ label: 'HOME', href: '/' }, { label: 'WISHLIST' }]} />

                <div className="mt-6 mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight uppercase">MY WISHLIST</h1>
                    <p className="text-black/40 text-xs font-bold tracking-widest mt-2 uppercase">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'ITEM' : 'ITEMS'} SAVED
                    </p>
                </div>

                {products.length > 0 ? (
                    <WishlistGrid products={products} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-light-gray flex items-center justify-center rounded-full mb-6">
                            <ShoppingBag size={32} className="text-black/20" />
                        </div>
                        <h2 className="text-2xl font-serif uppercase mb-4">Your wishlist is empty</h2>
                        <p className="text-black/60 text-sm max-w-xs mb-10 leading-relaxed font-medium">
                            Explore our collections and save your favorite pieces to find them easily later.
                        </p>
                        <Button variant="primary" className="!px-12 !py-4" onClick={() => window.location.href = '/collections'}>
                            START SHOPPING
                        </Button>
                    </div>
                )}
            </div>
            <Newsletter />
        </div>
    );
};

export default WishlistPage;
