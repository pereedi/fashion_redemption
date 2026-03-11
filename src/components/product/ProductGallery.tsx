import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryThumbnail from './GalleryThumbnail';

interface ProductGalleryProps {
    images: string[];
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Main Image */}
            <div
                className="relative aspect-[3/4] overflow-hidden bg-light-gray cursor-zoom-in group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        src={images[selectedImage]}
                        alt="Product"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'
                            }`}
                        style={
                            isZoomed
                                ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                                : {}
                        }
                    />
                </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((img, index) => (
                    <GalleryThumbnail
                        key={index}
                        image={img}
                        index={index}
                        isSelected={selectedImage === index}
                        onClick={setSelectedImage}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;
