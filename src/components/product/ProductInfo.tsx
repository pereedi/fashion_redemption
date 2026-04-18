import React, { useState, useMemo } from 'react';
import { Star, Heart, ShoppingBag, X, Check } from 'lucide-react';
import SizeSelector from './SizeSelector';
import ColorSelector from './ColorSelector';
import ProductAccordion from './ProductAccordion';
import Button from '../ui/Button';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductInfoProps {
    product: {
        id: number | string;
        name: string;
        price: string;
        basePrice: number;
        category: string;
        type?: string;
        rating: number;
        reviewCount: number;
        description: string;
        sizes: string[];
        colors: string[];
        stock: number;
        image: string;
        variants?: any[];
    };
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product: anyProduct }) => {
    const product = anyProduct;
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
    
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const isWishlisted = isInWishlist(String(product.id));

    // Calculate stock for specific variant combination
    const { currentStock, isOutOfStock } = useMemo(() => {
        // If there are no variants, use base product stock
        if (!product.variants || product.variants.length === 0) {
            return { currentStock: product.stock, isOutOfStock: product.stock === 0 };
        }

        // Find variant matching BOTH size and (if applicable) color
        const variant = product.variants.find(v => {
            const sizeMatch = !selectedSize || v.size === selectedSize;
            const colorMatch = !selectedColor || v.color === selectedColor;
            return sizeMatch && colorMatch;
        });

        if (variant) {
            return { currentStock: variant.stock, isOutOfStock: variant.stock === 0 };
        }

        // If a specific combination doesn't exist but variants do, it's out of stock for that combo
        return { currentStock: 0, isOutOfStock: true };
    }, [product.variants, product.stock, selectedSize, selectedColor]);

    const handleToggleWishlist = () => {
        toggleWishlist(String(product.id));
    };

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            basePrice: product.basePrice,
            image: product.image,
            size: selectedSize,
            color: selectedColor,
            quantity: 1
        });
    };

    const accordionSections = [
        {
            title: "Shipping & Returns",
            content: "Complimentary standard shipping on all orders. Returns are accepted within 30 days of purchase in original condition with tags attached."
        },
        {
            title: "Materials & Care",
            content: "Hand-crafted from premium materials. Dry clean only. Iron on low heat if necessary. Handle with care."
        }
      ];

    return (
        <div className="flex flex-col gap-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                <span>{product.type || 'COLLECTION'}</span>
                <span className="text-black/20">/</span>
                <span className="text-black/80">{product.category}</span>
            </div>

            {/* Title & Price */}
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif tracking-tight uppercase leading-tight">
                    {product.name}
                </h1>
                <div className="flex items-center gap-6">
                    <span className="text-2xl font-serif font-bold text-luxury-red">{product.price}</span>
                    <div className="flex items-center gap-2">
                        <div className="flex text-luxury-red">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase underline cursor-pointer">
                            {product.reviewCount} REVIEWS
                        </span>
                    </div>
                </div>
            </div>

            {/* Selection Area */}
            <div className="space-y-10 py-6 border-y border-gray-100">
                {product.colors && product.colors.length > 1 && (
                    <ColorSelector
                        colors={product.colors}
                        selectedColor={selectedColor}
                        onSelect={setSelectedColor}
                    />
                )}

                <SizeSelector
                    sizes={product.sizes}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                />
                
                {/* Visual Status Indicator */}
                <div className="flex items-center gap-3">
                    {isOutOfStock ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-luxury-red rounded border border-red-100 text-[10px] font-bold tracking-[0.1em] uppercase animate-pulse">
                            <X size={14} />
                            Currently Unavailable
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded border border-green-100 text-[10px] font-bold tracking-[0.1em] uppercase">
                            <Check size={14} />
                            {currentStock <= 5 ? `Only ${currentStock} Left` : 'In Stock'}
                        </div>
                    )}
                    
                    <span className="text-[10px] text-gray-400 font-medium italic">
                        {selectedColor} {selectedSize && `/ Size ${selectedSize}`}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-[13px] text-black/60 leading-relaxed font-medium max-w-lg">
                {product.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                <Button 
                    variant="primary" 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`!w-full !py-6 !rounded-none flex items-center justify-center gap-3 font-bold tracking-[0.3em] text-[11px] transition-all duration-300 ${isOutOfStock ? 'opacity-30 !cursor-not-allowed grayscale' : 'hover:bg-luxury-red/90'}`}
                >
                    <ShoppingBag size={20} strokeWidth={2.5} />
                    {isOutOfStock ? 'RESTOCKING SOON' : 'ADD TO BAG'}
                </Button>
                
                <button
                    onClick={handleToggleWishlist}
                    className={`w-full py-4 border flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 group ${isWishlisted
                        ? 'text-luxury-red border-luxury-red bg-luxury-red/5'
                        : 'border-black/10 text-black hover:border-luxury-red hover:text-luxury-red hover:bg-luxury-red/[0.02]'
                        }`}
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
                    {isWishlisted ? "REMOVE FROM WISHLIST" : "MY FAVOURITE"}
                </button>
            </div>

            {/* Accordions */}
            <ProductAccordion sections={accordionSections} />
        </div>
    );
};

export default ProductInfo;
