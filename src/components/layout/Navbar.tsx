import React, { useState } from 'react';
import { Search, Heart, User, ShoppingBag, UserCheck } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchModal from '../ui/SearchModal';
import logo from '../../assets/logo.png';
const Navbar: React.FC = () => {
    const { totalItems: wishlistTotal } = useWishlist();
    const { setIsCartOpen, totalItems: cartTotal } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navLinks = [
        { name: 'WOMEN', href: '/women' },
        { name: 'MEN', href: '/men' },
        { name: 'KIDS', href: '/kids' },
        { name: 'NEW ARRIVALS', href: '/new-arrivals' },
        { name: 'SALES', href: '/sales' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-light-gray">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                {/* Left Side: Logo */}
                <Link to="/" className="flex items-center">
                    <img 
                        src={logo}
                        alt="Fashion Redemption" 
                        className="h-24 w-auto object-contain"
                    />
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
                    <button 
                        className="hover:text-luxury-red transition-colors"
                        onClick={() => setIsSearchOpen(true)}
                    >
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
                        to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/profile') : '/login'} 
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
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </nav>
    );
};

export default Navbar;
