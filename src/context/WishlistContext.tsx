import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated && token) {
        try {
          const response = await fetch('http://localhost:5000/api/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setWishlistItems(data);
          }
        } catch (err) {
          console.error('Failed to load wishlist:', err);
        }
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        setWishlistItems(savedWishlist ? JSON.parse(savedWishlist) : []);
      }
      setIsInitialized(true);
    };

    loadWishlist();
  }, [isAuthenticated, token]);

  // Sync Guest Wishlist on Login
  useEffect(() => {
    const syncWishlist = async () => {
      if (isAuthenticated && token && isInitialized) {
        const guestWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (guestWishlist.length > 0) {
          try {
            const response = await fetch('http://localhost:5000/api/wishlist/sync', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ guestWishlist })
            });
            if (response.ok) {
              const data = await response.json();
              setWishlistItems(data);
              localStorage.removeItem('wishlist');
            }
          } catch (err) {
            console.error('Failed to sync wishlist:', err);
          }
        }
      }
    };

    syncWishlist();
  }, [isAuthenticated, token, isInitialized]);

  // Persistence for Guest
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  const toggleWishlist = async (productId: string) => {
    const pIdStr = String(productId);
    if (isAuthenticated && token) {
      try {
        const response = await fetch('http://localhost:5000/api/wishlist/toggle', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: pIdStr })
        });
        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        }
      } catch (err) {
        console.error('Failed to toggle wishlist:', err);
      }
    } else {
      setWishlistItems(prev => 
        prev.includes(pIdStr) 
          ? prev.filter(id => id !== pIdStr) 
          : [...prev, pIdStr]
      );
    }
  };

  const isInWishlist = (productId: string) => wishlistItems.includes(String(productId));

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      toggleWishlist, 
      isInWishlist,
      totalItems: wishlistItems.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
