import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductAccordionProps {
    sections: {
        title: string;
        content: React.ReactNode;
    }[];
}

const ProductAccordion: React.FC<ProductAccordionProps> = ({ sections }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="border-t border-black/10 mt-10">
            {sections.map((section, index) => (
                <div key={index} className="border-b border-black/10">
                    <button
                        onClick={() => toggleSection(index)}
                        className="w-full py-5 flex justify-between items-center text-xs font-bold tracking-widest uppercase hover:text-luxury-red transition-colors text-left"
                    >
                        {section.title}
                        {openIndex === index ? <Minus size={14} /> : <Plus size={14} />}
                    </button>
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="pb-6 text-xs text-black/60 leading-relaxed font-medium">
                                    {section.content}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default ProductAccordion;
