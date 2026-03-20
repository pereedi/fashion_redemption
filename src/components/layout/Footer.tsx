import React from 'react';
import logo from "../../assets/logo.png";
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-light-gray">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Info */}
                    <div>
                        <div className="mb-6">
                            <img 
                                src= {logo} 
                                alt="Fashion Redemption" 
                                className="h-24 w-auto object-contain -ml-2"
                            />
                        </div>
                        <p className="text-black/50 text-sm leading-relaxed mb-8 max-w-xs">
                            The destination for those who seek to redefine standard by through high-fashion expressions.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 border border-black/5 hover:border-luxury-red hover:text-luxury-red rounded-full transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2 border border-black/5 hover:border-luxury-red hover:text-luxury-red rounded-full transition-all">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="p-2 border border-black/5 hover:border-luxury-red hover:text-luxury-red rounded-full transition-all">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 border border-black/5 hover:border-luxury-red hover:text-luxury-red rounded-full transition-all">
                                <Youtube size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold text-xs tracking-widest uppercase mb-8">NAVIGATION</h4>
                        <ul className="space-y-4 text-sm font-medium text-black/60">
                            <li><a href="/women" className="hover:text-luxury-red transition-colors">Women</a></li>
                            <li><a href="/men" className="hover:text-luxury-red transition-colors">Men</a></li>
                            <li><a href="/kids" className="hover:text-luxury-red transition-colors">Kids</a></li>
                            <li><a href="/new-arrivals" className="hover:text-luxury-red transition-colors">New Arrivals</a></li>
                            <li><a href="/sales" className="hover:text-luxury-red transition-colors">Sales</a></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-bold text-xs tracking-widest uppercase mb-8">CUSTOMER SERVICE</h4>
                        <ul className="space-y-4 text-sm text-black/60">
                            <li><a href="#" className="hover:text-luxury-red transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-luxury-red transition-colors">Size Guide</a></li>
                            <li><a href="#" className="hover:text-luxury-red transition-colors">Track Your Order</a></li>
                            <li><a href="#" className="hover:text-luxury-red transition-colors">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Studio Info */}
                    <div>
                        <h4 className="font-bold text-xs tracking-widest uppercase mb-8">FASHION STUDIO</h4>
                        <ul className="space-y-4 text-sm text-black/60">
                            <li className="flex flex-col">
                                <span className="text-black/30 font-bold text-[10px]">ADDRESS</span>
                                124 Redemption Blvd, 2010 Miami, FL 33101
                            </li>
                            <li className="flex flex-col">
                                <span className="text-black/30 font-bold text-[10px]">EMAIL</span>
                                studio@fashionredemption.com
                            </li>
                            <li className="flex flex-col">
                                <span className="text-black/30 font-bold text-[10px]">PHONE</span>
                                +1 (305) 555-0122
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-10 border-t border-light-gray flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-black/40 font-bold tracking-widest">
                        © 2024 FASHION REDEMPTION. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8 text-[10px] text-black/40 font-bold tracking-widest uppercase">
                        <a href="#" className="hover:text-black">Privacy Policy</a>
                        <a href="#" className="hover:text-black">Terms of Service</a>
                        <a href="#" className="hover:text-black">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
