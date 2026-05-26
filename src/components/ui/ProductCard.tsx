import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import getCleanImageUrl from '../../utils/imageHelper';

interface ProductCardProps {
    id: number | string;
    image: string;
    name: string;
    price: string;
    basePrice: number;
    category?: string;
    className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, image, name, price, basePrice, category, className = '' }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const isWishlisted = isInWishlist(String(id));

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(String(id));
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id,
            name,
            price,
            basePrice,
            image,
            size: 'S', // Default size for quick add
            quantity: 1
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`group bg-white overflow-hidden transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${className}`}
        >
            <Link to={`/product/${id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                        src={getCleanImageUrl(image, 'card')}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <button
                        onClick={handleToggleWishlist}
                        className={`absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full transition-all shadow-sm z-10 ${isWishlisted ? 'text-luxury-red scale-110' : 'text-black hover:text-luxury-red'
                            }`}
                    >
                        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                    
                    {/* Quick Add Button */}
                    <button
                        onClick={handleQuickAdd}
                        className="absolute bottom-4 left-4 right-4 py-3 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold tracking-[0.3em] uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 rounded-sm flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={14} />
                        QUICK ADD
                    </button>
                </div>

                <div className="p-6 text-center space-y-3">
                    {category && (
                        <span className="text-[9px] text-luxury-red font-bold uppercase tracking-[0.2em] block">
                            {category}
                        </span>
                    )}
                    <h3 className="text-[11px] font-bold tracking-[0.1em] text-black/80 group-hover:text-luxury-red transition-colors uppercase leading-tight">
                        {name}
                    </h3>
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <p className="text-luxury-red font-serif font-bold text-lg">
                            {price}
                        </p>
                        <div className="w-8 h-[1px] bg-black/5 group-hover:w-16 group-hover:bg-luxury-red/20 transition-all duration-700" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
