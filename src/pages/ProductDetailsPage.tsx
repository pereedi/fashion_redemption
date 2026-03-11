import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Newsletter from '../sections/Newsletter';
import ProductGallery from '../components/product/ProductGallery';
import ProductInfo from '../components/product/ProductInfo';
import CompleteTheLook from '../components/product/CompleteTheLook';
import ReviewSection from '../components/product/ReviewSection';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found or server error');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif uppercase tracking-[0.3em] gap-4">
      <div className="w-10 h-10 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
      <span>Loading Collection...</span>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif text-center px-4">
      <h2 className="text-4xl uppercase mb-6">Product Not Found</h2>
      <p className="text-black/60 text-sm max-w-md mb-8 leading-relaxed">
        The piece you're looking for might have been moved or is no longer part of our current collection.
      </p>
      <button 
        onClick={() => window.location.href='/collections'}
        className="px-12 py-4 bg-luxury-red text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black transition-all"
      >
        BACK TO COLLECTIONS
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 mb-24">
          {/* Gallery - 60% */}
          <div className="w-full lg:w-[60%]">
            <ProductGallery images={product.images} />
          </div>

          {/* Info - 40% */}
          <div className="w-full lg:w-[35%]">
            <ProductInfo product={product} />
          </div>
        </div>

        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <CompleteTheLook products={product.relatedProducts} />
        )}
        
        <ReviewSection 
          rating={product.rating} 
          reviewCount={product.reviewCount} 
          reviews={product.reviews || []} 
        />
      </main>

      <Newsletter />
    </div>
  );
};

export default ProductDetailsPage;
