import { Search, Heart, User, ShoppingBag, UserCheck } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CollectionsNavbar: React.FC = () => {
    const { totalItems: wishlistTotal } = useWishlist();
    const { setIsCartOpen, totalItems: cartTotal } = useCart();
    const { isAuthenticated } = useAuth();
    const navLinks = [
        { name: 'DRESSES', href: '/collections/dresses' },
        { name: 'TOPS', href: '/collections/tops' },
        { name: 'BAGS', href: '/collections/bags' },
        { name: 'SHOES', href: '/collections/shoes' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-light-gray">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                {/* Left Side: Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-luxury-red rounded-sm rotate-45" />
                    <span className="font-serif text-xl font-bold tracking-tighter">
                        FASHION <span className="text-luxury-red">REDEMPTION</span>
                    </span>
                </Link>

                {/* Center: Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.href}
                            className={({ isActive }) => `
                                text-xs font-semibold tracking-[0.2em] py-1 transition-all border-b-2
                                ${isActive ? 'border-luxury-red text-luxury-red' : 'border-transparent hover:border-luxury-red'}
                            `}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                {/* Right Side: Icons */}
                <div className="flex items-center gap-5">
                    <button className="hover:text-luxury-red transition-colors">
                        <Search size={20} strokeWidth={1.5} />
                    </button>
                    <Link to="/wishlist" className="hover:text-luxury-red transition-colors relative">
                        <Heart size={20} strokeWidth={1.5} />
                        {wishlistTotal > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-red text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                {wishlistTotal}
                            </span>
                        )}
                    </Link>
                    <Link 
                        to={isAuthenticated ? "/profile" : "/login"} 
                        className={`hover:text-luxury-red transition-colors ${isAuthenticated ? 'text-luxury-red' : ''}`}
                    >
                        {isAuthenticated ? <UserCheck size={20} strokeWidth={2} /> : <User size={20} strokeWidth={1.5} />}
                    </Link>
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="hover:text-luxury-red transition-colors relative"
                    >
                        <ShoppingBag size={20} strokeWidth={1.5} />
                        {cartTotal > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-red text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                {cartTotal}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default CollectionsNavbar;
