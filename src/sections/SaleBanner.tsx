import React from 'react';
import Button from '../components/ui/Button';

const SaleBanner: React.FC = () => {
    return (
        <section className="bg-luxury-red py-16">
            <div className="container mx-auto px-4 md:px-8 text-center text-white">
                <h2 className="text-3xl md:text-5xl font-serif mb-4 tracking-tighter">
                    SEASONAL CLEARANCE: UP TO 50% OFF
                </h2>
                <p className="text-white/80 font-bold tracking-[0.3em] text-sm mb-10">
                    USE CODE: REDEEM
                </p>
                <Button variant="white" className="px-10">
                    SHOP CLEARANCE
                </Button>
            </div>
        </section>
    );
};

export default SaleBanner;
