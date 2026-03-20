import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import ShippingForm from '../components/checkout/ShippingForm';
import ShippingMethodSelector from '../components/checkout/ShippingMethodSelector';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import CardForm from '../components/checkout/CardForm';
import OrderSummary from '../components/checkout/OrderSummary';
import { useCart } from '../context/CartContext';
import Navbar from '../components/layout/Navbar';


type CheckoutStep = 'cart' | 'information' | 'shipping' | 'payment';

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<CheckoutStep>('information');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [selectedShipping, setSelectedShipping] = useState('express');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cartItems, totalSubtotal, clearCart } = useCart();

  const shippingMethods = [
    { id: 'express', name: 'Express Worldwide Delivery', time: '2-3 Business Days', price: 25.00 },
    { id: 'standard', name: 'Standard Shipping', time: '5-10 Business Days', price: 0 }
  ];

  const currentShipping = shippingMethods.find(m => m.id === selectedShipping);
  const tax = totalSubtotal * 0.08;
  const discount = 15.00;
  const total = totalSubtotal + (currentShipping?.price || 0) + tax - discount;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        customer: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image
        })),
        shipping: {
          method: currentShipping?.name || '',
          price: currentShipping?.price || 0
        },
        payment: {
          method: selectedPayment
        },
        totals: {
          subtotal: totalSubtotal,
          tax,
          discount,
          total
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Order submission failed');

      clearCart();
      navigate('/order-confirmation');
    } catch (err) {
      console.error(err);
      alert('FAILED to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
        <h2 className="text-xl font-serif uppercase tracking-widest text-black/40">Your bag is empty</h2>
        <a href="/sales" className="mt-8 px-12 py-5 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-red transition-all duration-500">
          CONTINUE SHOPPING
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 pt-12 pb-32">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left Column: Form Section */}
          <div className="lg:w-[65%] space-y-12">
            <CheckoutSteps currentStep={step} />

            <AnimatePresence mode="wait">
              {step === 'information' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <ShippingForm formData={formData} onChange={handleInputChange} />
                  <div className="pt-8 border-t border-black/5">
                    <button 
                      onClick={() => setStep('shipping')}
                      className="px-12 py-5 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-red transition-all duration-500"
                    >
                      CONTINUE TO SHIPPING
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div
                  key="ship"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <ShippingMethodSelector 
                    methods={shippingMethods}
                    selectedId={selectedShipping}
                    onSelect={setSelectedShipping}
                  />
                  <div className="flex items-center gap-8 pt-8 border-t border-black/5">
                    <button 
                      onClick={() => setStep('payment')}
                      className="px-12 py-5 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-red transition-all duration-500"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                    <button 
                      onClick={() => setStep('information')}
                      className="text-[10px] font-bold tracking-widest text-black/40 uppercase hover:text-black transition-colors"
                    >
                      RETURN TO INFORMATION
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="pay"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <PaymentMethodSelector 
                    selectedId={selectedPayment}
                    onSelect={setSelectedPayment}
                  />
                  
                  {selectedPayment === 'card' && (
                    <CardForm formData={formData} onChange={handleInputChange} />
                  )}

                  <div className="flex items-center gap-8 pt-8 border-t border-black/5">
                    <button 
                      onClick={handleCompleteOrder}
                      disabled={isSubmitting}
                      className="px-12 py-5 bg-luxury-red text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-black transition-all duration-500 disabled:bg-black/40"
                    >
                      {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
                    </button>
                    <button 
                      onClick={() => setStep('shipping')}
                      className="text-[10px] font-bold tracking-widest text-black/40 uppercase hover:text-black transition-colors"
                    >
                      RETURN TO SHIPPING
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[35%]">
            <OrderSummary 
              onComplete={handleCompleteOrder} 
              shippingCost={currentShipping?.price || 0}
              tax={tax}
              discount={discount}
              total={total}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>


    </div>
  );
};

export default CheckoutPage;
