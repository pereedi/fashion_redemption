import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { apiFetch } from '../config/apiClient';
import API_BASE_URL from '../config/api';

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentRef = searchParams.get('paymentRef');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        if (paymentRef) {
          const res = await apiFetch(`${API_BASE_URL}/api/orders/verify-espees/${paymentRef}`);
          const data = await res.json();
          setStatus(data.status === 'success' ? 'success' : 'failed');
        } else if (orderId) {
          const res = await apiFetch(`${API_BASE_URL}/api/orders/verify-order/${orderId}`);
          const data = await res.json();
          setStatus(data.status === 'success' ? 'success' : 'failed');
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };
    verify();
  }, [orderId, paymentRef]);

  if (status === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif uppercase tracking-[0.3em] gap-4">
      <div className="w-10 h-10 border-2 border-luxury-red border-t-transparent rounded-full animate-spin" />
      <span>Verifying your order...</span>
    </div>
  );

  if (status === 'failed') return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif text-center px-4">
      <h2 className="text-4xl uppercase mb-6">Payment Not Confirmed</h2>
      <p className="text-black/60 text-sm max-w-md mb-8 leading-relaxed">
        We couldn't verify your payment. If you believe this is an error, please contact support with your order reference.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="px-12 py-4 bg-luxury-red text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black transition-all"
      >
        RETURN HOME
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-24 flex flex-col items-center text-center">
        <CheckCircle size={64} className="text-green-500 mb-8" />
        <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-tight mb-6">
          Order Confirmed
        </h1>
        <p className="text-black/60 text-sm max-w-md leading-relaxed mb-4">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        {orderId && (
          <p className="text-[11px] font-bold tracking-widest text-black/40 uppercase mb-12">
            Order Reference: <span className="text-black">{orderId}</span>
          </p>
        )}
        <button
          onClick={() => window.location.href = '/'}
          className="px-12 py-4 bg-luxury-red text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black transition-all"
        >
          CONTINUE SHOPPING
        </button>
      </main>
    </div>
  );
};

export default OrderSuccessPage;