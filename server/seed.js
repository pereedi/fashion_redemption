import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/redemption';

const products = [
  {
    id: "1",
    name: "Crimson Silk Gala Gown",
    price: "$890.00",
    category: "women",
    type: "clothing",
    colors: ["Red"],
    rating: 4.8,
    reviewCount: 12,
    description: "Elevate your evening presence with our signature gala gown. Hand-crafted from premium 100% Italian mulberry silk, this floor-sweeping silhouette features a sophisticated draped neckline and a daring open-back design. A true masterpiece of modern couture.",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=2000"
    ],
    reviews: [],
    relatedProducts: []
  },
  {
    id: "2",
    name: "Obsidian Moto Jacket",
    price: "$1,250.00",
    category: "men",
    type: "clothing",
    colors: ["Black"],
    rating: 4.9,
    reviewCount: 24,
    description: "The ultimate expression of urban rebellion. Crafted from full-grain Italian lambskin with high-polished silver hardware, this iconic piece defined the season's silhouette.",
    sizes: ["S", "M", "L", "XL"],
    stock: 2,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=2000"
    ],
    reviews: [],
    relatedProducts: []
  },
  {
    id: "3",
    name: "Architectural Cloud Dress",
    price: "$1,450.00",
    category: "women",
    type: "clothing",
    colors: ["White"],
    rating: 4.7,
    reviewCount: 8,
    description: "A sculptural masterpiece hand-draped from silk organza. This dress mimics the weightless beauty of clouds with its voluminous, layered skirt and structured bodice.",
    sizes: ["XS", "S", "M"],
    stock: 1,
    images: [
      "https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=2000"
    ],
    reviews: [],
    relatedProducts: []
  },
  {
    id: "4",
    name: "Tailored Italian Suit",
    price: "$2,800.00",
    category: "men",
    type: "clothing",
    colors: ["Navy"],
    rating: 5.0,
    reviewCount: 5,
    description: "Precision-tailored from Super 150s wool, this two-button suit features a slim silhouette, hand-finished lapels, and naturally sourced horn buttons.",
    sizes: ["M", "L", "XL"],
    stock: 4,
    images: [
      "https://images.unsplash.com/photo-1594932224456-802d9242efbd?auto=format&fit=crop&q=80&w=2000"
    ],
    reviews: [],
    relatedProducts: []
  }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    console.log('Existing products cleared');
    
    await Product.insertMany(products);
    console.log('Initial products seeded successfully');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDB();
