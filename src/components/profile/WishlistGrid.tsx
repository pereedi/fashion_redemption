import React from 'react';
import ProductCard from '../ui/ProductCard';

interface WishlistGridProps {
  products: any[];
}

const WishlistGrid: React.FC<WishlistGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 mb-20">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          id={product.id}
          name={product.name}
          price={product.price}
          basePrice={product.base_price || product.basePrice}
          image={product.images?.[0] || product.image}
          category={product.category}
        />
      ))}
    </div>
  );
};

export default WishlistGrid;
