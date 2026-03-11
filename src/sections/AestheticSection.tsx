import React from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const AestheticSection: React.FC = () => {
    return (
        <section className="bg-dark-navy w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row">
                {/* Left Side: Image */}
                <div className="w-full lg:w-1/2 h-[500px] lg:h-auto relative">
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200"
                        alt="Editorial Shot"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    {/* Decorative elements */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[80%] h-[80%] border border-white/20" />
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-white text-4xl md:text-5xl font-serif mb-8 leading-tight">
                            COMPLETE THE <br /> AESTHETIC
                        </h2>
                        <p className="text-white/60 mb-12 max-w-md leading-relaxed">
                            Don't just wear the clothes, live the redemption. Our curated looks
                            are designed to make a statement from head to toe.
                        </p>

                        <div className="space-y-6 mb-12">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-luxury-red flex items-center justify-center text-white text-xs font-bold font-serif">
                                    01
                                </div>
                                <div>
                                    <h4 className="text-white font-bold leading-none mb-1">CURATED ENSEMBLES</h4>
                                    <p className="text-white/40 text-xs tracking-wide">Hand-picked by our lead stylists.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-luxury-red flex items-center justify-center text-white text-xs font-bold font-serif">
                                    02
                                </div>
                                <div>
                                    <h4 className="text-white font-bold leading-none mb-1">EXCLUSIVE MATERIALS</h4>
                                    <p className="text-white/40 text-xs tracking-wide">Sourced from the finest tanneries in Italy.</p>
                                </div>
                            </div>
                        </div>

                        <Button variant="outline">
                            SHOP THE LOOK
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AestheticSection;
