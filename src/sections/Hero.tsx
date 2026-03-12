import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Hero: React.FC = () => {
    const images = [

        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000"
    ];

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <section className="relative h-[90vh] w-full overflow-hidden bg-black">
            {/* Background Image Carousel */}
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentImage}
                    src={images[currentImage]}
                    alt="Fashion Model"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 md:px-8 flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-2xl"
                >
                    <h1 className="text-white text-5xl md:text-8xl font-serif leading-[0.9] mb-6">
                        REDEMPTION <br />
                        STARTS HERE
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl tracking-wide font-light mb-10 max-w-md">
                        EXQUISITE CRAFTSMANSHIP MEETS <br />
                        MODERN REBELLION.
                    </p>
                    <Link to="/collections">
                        <Button variant="primary" className="px-12 py-4 text-base">
                            SHOP NOW
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Bottom accent / Pagination dots for carousel */}
            <div className="absolute bottom-10 left-8 md:left-12 flex items-center gap-4">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`transition-all duration-500 h-[2px] ${idx === currentImage ? 'w-10 bg-white' : 'w-6 bg-white/30'}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
