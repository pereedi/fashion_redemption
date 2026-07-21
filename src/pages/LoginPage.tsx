import { apiFetch } from '../config/apiClient';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import logo from '../assets/logo.png';
import API_BASE_URL from '../config/api';
import KingsChatButton from '../components/auth/KingsChatButton';


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromCheckout = location.state?.from?.pathname === '/checkout';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      login(data.data.user, data.token);
      
      let origin = location.state?.from?.pathname || '/sales';
      if (data.data.user.role === 'admin') {
        origin = '/admin';
      }
      
      navigate(origin);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKingsChatSuccess = (user: any, token: string) => {
    login(user, token);
    let origin = location.state?.from?.pathname || '/sales';
    if (user.role === 'admin') {
      origin = '/admin';
    }
    navigate(origin);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 flex items-center justify-center py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Fashion Redemption" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-serif uppercase tracking-tighter">
              {fromCheckout ? 'Complete Your Order' : 'Welcome Back'}
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">
              {fromCheckout 
                ? 'Please log in or create an account to complete your order.' 
                : 'Enter your credentials to access your redemption'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Password</label>
                  <button type="button" className="text-[9px] font-bold tracking-widest text-luxury-red uppercase hover:opacity-70 transition-opacity">Forgot Password?</button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
                />
              </div>
            </div>

            {error && <p className="text-[10px] font-bold tracking-widest text-luxury-red uppercase text-center animate-shake">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase rounded-sm hover:bg-luxury-red transition-all duration-500 disabled:bg-black/40 group"
            >
              {isLoading ? 'SIGNING IN...' : 'LOGIN'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-4 text-black/40">Or continue with</span>
              </div>
            </div>

            <KingsChatButton onSuccess={handleKingsChatSuccess} onError={setError} />
          </form>

          <div className="text-center pt-8 border-t border-black/5">
            <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              New to Fashion Redemption? {' '}
              <Link to="/signup" className="text-black hover:text-luxury-red transition-colors ml-2 underline underline-offset-4">Create an account</Link>
            </p>
          </div>
        </motion.div>
      </main>


    </div>
  );
};

export default LoginPage;
