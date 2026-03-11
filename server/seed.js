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
    category: "GOWNS",
    rating: 4.8,
    reviewCount: 12,
    description: "Elevate your evening presence with our signature gala gown. Hand-crafted from premium 100% Italian mulberry silk, this floor-sweeping silhouette features a sophisticated draped neckline and a daring open-back design. A true masterpiece of modern couture.",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1539109132314-347596ad9cf2?auto=format&fit=crop&q=80&w=2000",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"
    ],
    reviews: [
      {
        user: "Sophia Reynolds",
        rating: 5,
        date: "2 DAYS AGO",
        comment: "The quality of the silk is unmatched. I wore this to a gala last night and received endless compliments. The fit is true to size and the drape is stunning.",
        images: [
          "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=400",
          "https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=400"
        ],
        avatar: "S"
      },
      {
        user: "Elena Vance",
        rating: 4,
        date: "1 WEEK AGO",
        comment: "Absolutely breathtaking. The color is a deep, rich crimson that looks even better in person. Minus half a star because it required professional steaming after arrival.",
        avatar: "E"
      }
    ],
    relatedProducts: [
      {
        id: "101",
        name: "Midnight Stilettos",
        price: "$450.00",
        category: "FOOTWEAR",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "102",
        name: "Gilded Silk Clutch",
        price: "$320.00",
        category: "ACCESSORIES",
        image: "https://images.unsplash.com/photo-1584917033904-49097e3f1782?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "103",
        name: "Stellar Drop Earrings",
        price: "$2,100.00",
        category: "JEWELRY",
        image: "https://images.unsplash.com/photo-1635767798638-3e2827e84a4b?auto=format&fit=crop&q=80&w=600"
      }
    ]
  },
  {
    id: "2",
    name: "Obsidian Moto Jacket",
    price: "$1,250.00",
    category: "OUTERWEAR",
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
