import React, { useState } from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import SizeSelector from './SizeSelector';
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
        rating: number;
        reviewCount: number;
        description: string;
        sizes: string[];
        stock: number;
        image: string;
    };
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    const [selectedSize, setSelectedSize] = useState('S');
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const isWishlisted = isInWishlist(String(product.id));

    const handleToggleWishlist = () => {
        toggleWishlist(String(product.id));
    };

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            basePrice: product.basePrice,
            image: product.image,
            size: selectedSize,
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
            content: "Hand-crafted from premium 100% Italian mulberry silk. Dry clean only. Iron on low heat if necessary. Handle with care."
        }
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                <span>EVENING WEAR</span>
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

            {/* Description */}
            <p className="text-xs text-black/60 leading-relaxed font-medium max-w-lg">
                {product.description}
            </p>

            {/* Size Selection */}
            <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
            />

            {/* Stock Indicator */}
            {product.stock <= 5 && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-luxury-red tracking-widest uppercase">
                    <div className="w-1.5 h-1.5 bg-luxury-red rounded-full animate-pulse" />
                    Only {product.stock} left in stock
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-4">
                <Button 
                    variant="primary" 
                    onClick={handleAddToCart}
                    className="!w-full !py-5 !rounded-none flex items-center justify-center gap-3 font-bold tracking-[0.3em] text-[10px]"
                >
                    <ShoppingBag size={18} strokeWidth={2.5} />
                    ADD TO BAG
                </Button>
                <button
                    onClick={handleToggleWishlist}
                    className={`w-full py-4 border flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all group ${isWishlisted
                        ? 'text-luxury-red border-luxury-red bg-luxury-red/5'
                        : 'border-black/10 text-black hover:border-black'
                        }`}
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
                    {isWishlisted ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
                </button>
            </div>

            {/* Accordions */}
            <ProductAccordion sections={accordionSections} />
        </div>
    );
};

export default ProductInfo;
