import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: String, required: true },
  comment: { type: String, required: true },
  avatar: { type: String },
  images: [{ type: String }]
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },
  reviewCount: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  sizes: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String, required: true }],
  reviews: [reviewSchema],
  relatedProducts: [{
    id: String,
    name: String,
    price: String,
    category: String,
    image: String
  }]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
