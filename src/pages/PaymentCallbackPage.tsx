import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import API_BASE_URL from '../config/api';
import { useCart } from '../context/CartContext';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  const orderId = searchParams.get('orderId');
  const isFailed = searchParams.get('status') === 'failed';

  useEffect(() => {
    const verifyPayment = async () => {
      if (isFailed) {
        setStatus('failed');
        setMessage('Payment was cancelled or failed. Please try again.');
        return;
      }

      if (!orderId) {
        setStatus('failed');
        setMessage('Invalid order reference.');
        return;
      }

      try {
        // We need the payment_ref to verify. 
        // Our backend can find it by orderId or we can pass it if Espees appends it.
        // Let's assume our backend endpoint handles finding the ref by orderId if we update it, 
        // OR we just fetch the order first.
        
        // Let's call a dedicated verify endpoint that takes orderId
        const response = await fetch(`${API_BASE_URL}/api/orders/verify-order/${orderId}`);
        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          clearCart();
        } else {
          setStatus('failed');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('failed');
        setMessage('Network error during verification.');
      }
    };

    verifyPayment();
  }, [orderId, isFailed, clearCart]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {status === 'loading' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Loader2 size={64} className="text-luxury-red animate-spin" />
              </div>
              <h2 className="text-2xl font-serif uppercase tracking-widest">Verifying Payment</h2>
              <p className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                Please do not refresh the page while we confirm your transaction with Espees.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle size={40} strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif uppercase tracking-tight">Payment Successful</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
                  Your order has been confirmed. A receipt with shipping details has been sent to your email.
                </p>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full py-5 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-red transition-all duration-500 flex items-center justify-center gap-3"
              >
                VIEW MY ORDERS <ArrowRight size={14} />
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-luxury-red">
                  <XCircle size={40} strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif uppercase tracking-tight">Payment Failed</h2>
                <p className="text-sm text-black/60 italic font-serif">
                  {message}
                </p>
              </div>
              <div className="pt-4 space-y-4">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-5 bg-black text-white text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-red transition-all duration-500"
                >
                  RETRY CHECKOUT
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="text-[10px] font-bold tracking-widest text-black/40 uppercase hover:text-black transition-colors"
                >
                  RETURN TO HOME
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentCallbackPage;
