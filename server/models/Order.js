import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  image: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  items: [orderItemSchema],
  shipping: {
    method: { type: String, required: true },
    price: { type: Number, required: true }
  },
  payment: {
    method: { type: String, required: true }
  },
  totals: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  status: { type: String, default: 'pending', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
