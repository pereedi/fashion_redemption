import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import logo from '../assets/logo.png';
import API_BASE_URL from '../config/api';


const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      login(data.data.user, data.token);
      navigate('/sales');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-4xl font-serif uppercase tracking-tighter">Join the Redemption</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase">Create an account for a seamless luxury experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Alexander McQueen"
                className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-white border border-black/10 rounded-sm focus:border-luxury-red outline-none transition-all placeholder:text-black/10 text-sm"
                />
              </div>
            </div>

            {error && <p className="text-[10px] font-bold tracking-widest text-luxury-red uppercase text-center animate-shake">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase rounded-sm hover:bg-luxury-red transition-all duration-500 disabled:bg-black/40 group mt-4"
            >
              {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
          </form>

          <div className="text-center pt-8 border-t border-black/5">
            <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Already have an account? {' '}
              <Link to="/login" className="text-black hover:text-luxury-red transition-colors ml-2 underline underline-offset-4">Log In</Link>
            </p>
          </div>
        </motion.div>
      </main>


    </div>
  );
};

export default SignupPage;
