import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import GalleryThumbnail from './GalleryThumbnail';
import getCleanImageUrl from '../../utils/imageHelper';

interface ProductGalleryProps {
    images: string[];
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
    const safeImages = images?.length ? images : [];
    const [selectedImage, setSelectedImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Preload adjacent images for smooth lightbox navigation
    useEffect(() => {
        safeImages.forEach((img, i) => {
            if (Math.abs(i - selectedImage) <= 1) {
                const image = new Image();
                image.src = getCleanImageUrl(img, 'zoom');
            }
        });
    }, [selectedImage, safeImages]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = '';
    };

    const lightboxPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxIndex(i => (i - 1 + safeImages.length) % safeImages.length);
    };

    const lightboxNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxIndex(i => (i + 1) % safeImages.length);
    };

    // Close lightbox on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + safeImages.length) % safeImages.length);
            if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % safeImages.length);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, safeImages.length]);

    return (
        <>
            <div className="flex flex-col gap-6 w-full">
                {/* Main Image */}
                <div
                    className="relative aspect-[3/4] overflow-hidden bg-light-gray cursor-zoom-in group"
                    onClick={() => openLightbox(selectedImage)}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={selectedImage}
                            src={getCleanImageUrl(safeImages[selectedImage], 'main')}
                            alt="Product"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="eager"
                            decoding="async"
                        />
                    </AnimatePresence>

                    {/* Zoom hint overlay */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <ZoomIn size={18} />
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-4">
                    {safeImages.slice(0, 4).map((img, index) => (
                        <GalleryThumbnail
                            key={index}
                            image={img}
                            index={index}
                            isSelected={selectedImage === index}
                            onClick={(i) => { setSelectedImage(i); }}
                        />
                    ))}
                </div>
            </div>

            {/* Lightbox — renders at true resolution, no CSS upscaling */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeLightbox}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
                            onClick={closeLightbox}
                        >
                            <X size={24} />
                        </button>

                        {/* Prev button */}
                        {safeImages.length > 1 && (
                            <button
                                className="absolute left-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                                onClick={lightboxPrev}
                            >
                                <ChevronLeft size={28} />
                            </button>
                        )}

                        {/* Full-res image — no scaling applied, browser renders at native resolution */}
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={lightboxIndex}
                                src={getCleanImageUrl(safeImages[lightboxIndex], 'zoom')}
                                alt="Product full view"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.2 }}
                                className="max-h-[90vh] max-w-[90vw] object-contain select-none"
                                onClick={(e) => e.stopPropagation()}
                                draggable={false}
                            />
                        </AnimatePresence>

                        {/* Next button */}
                        {safeImages.length > 1 && (
                            <button
                                className="absolute right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10"
                                onClick={lightboxNext}
                            >
                                <ChevronRight size={28} />
                            </button>
                        )}

                        {/* Dot indicators */}
                        {safeImages.length > 1 && (
                            <div className="absolute bottom-6 flex gap-2">
                                {safeImages.slice(0, 4).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                                        className={`w-2 h-2 rounded-full transition-all ${i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductGallery;