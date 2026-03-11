import React from 'react';

const Newsletter: React.FC = () => {
    return (
        <section className="py-24 bg-light-gray">
            <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-serif mb-4 uppercase tracking-tight">
                    JOIN THE FASHION REDEMPTION COMMUNITY
                </h2>
                <p className="text-black/50 mb-10 max-w-xl mx-auto">
                    Get early access to exclusive drops, editorial content, and a 15% discount on your first order.
                </p>

                <form className="flex flex-col md:flex-row gap-0 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="ENTER YOUR EMAIL"
                        className="flex-grow px-6 py-4 bg-white border-2 border-transparent focus:border-luxury-red outline-none transition-all text-xs font-bold tracking-widest"
                    />
                    <button className="bg-luxury-red text-white px-8 py-4 text-xs font-bold tracking-[0.2em] hover:bg-black transition-colors">
                        SUBSCRIBE
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
