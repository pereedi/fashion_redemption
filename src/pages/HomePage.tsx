import React from 'react';
import Hero from '../sections/Hero';
import TrendingCollections from '../sections/TrendingCollections';
import AestheticSection from '../sections/AestheticSection';
import NewArrivals from '../sections/NewArrivals';
import SaleBanner from '../sections/SaleBanner';
import Newsletter from '../sections/Newsletter';
import Navbar from '../components/layout/Navbar';

const HomePage: React.FC = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <TrendingCollections />
            <AestheticSection />
            <NewArrivals />
            <SaleBanner />
            <Newsletter />
        </>
    );
};

export default HomePage;
