import React from 'react';
import Hero from '../sections/Hero';
import TrendingCollections from '../sections/TrendingCollections';
import AestheticSection from '../sections/AestheticSection';
import NewArrivals from '../sections/NewArrivals';
import SaleBanner from '../sections/SaleBanner';
import Newsletter from '../sections/Newsletter';
import Navbar from '../components/layout/Navbar';
import { useSEO } from '../hooks/useSEO';

const HomePage: React.FC = () => {
    useSEO({ title: 'Home' });
    return (
        <>
            <Navbar />
            <Hero />
            <TrendingCollections />
            <NewArrivals />
            <SaleBanner />
            <AestheticSection />
            <Newsletter />
        </>
    );
};

export default HomePage;
