import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
    id: number | string;
    image: string;
    name: string;
    price: string;
    category?: string;
    className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, image, name, price, category, className = '' }) => {
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
            className={`group bg-white overflow-hidden shadow-soft transition-all duration-500 hover:shadow-xl ${className}`}
        >
            <Link to={`/product/${id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                        src={image}
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

                <div className="p-5 text-center">
                    {category && (
                        <span className="text-[10px] text-luxury-red font-bold uppercase tracking-widest block mb-1">
                            {category}
                        </span>
                    )}
                    <h3 className="text-sm font-medium tracking-tight mb-2 group-hover:text-luxury-red transition-colors uppercase">
                        {name}
                    </h3>
                    <p className="text-luxury-red font-serif font-bold text-lg">
                        {price}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
