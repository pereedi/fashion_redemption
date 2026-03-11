import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.href ? (
                        <Link to={item.href} className="hover:text-black transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-black/80">{item.label}</span>
                    )}
                    {index < items.length - 1 && <ChevronRight size={10} className="text-black/20" />}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
