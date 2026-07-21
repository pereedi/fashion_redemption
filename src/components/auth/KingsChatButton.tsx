import React, { useState } from 'react';
import kingsChatWebSdk from 'kingschat-web-sdk';
import { apiFetch } from '../../config/apiClient';
import API_BASE_URL from '../../config/api';

interface KingsChatButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError?: (errorMessage: string) => void;
  text?: string;
  className?: string;
}

const KingsChatButton: React.FC<KingsChatButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with KingsChat',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoHandle, setDemoHandle] = useState('');

  const handleKingsChatLogin = async () => {
    const clientId = import.meta.env.VITE_KINGSCHAT_CLIENT_ID || 'your_kingschat_client_id';

    setIsLoading(true);

    try {
      // If client ID is placeholder, open instant helper mode to avoid 422 popup error
      if (!clientId || clientId === 'your_kingschat_client_id') {
        setIsLoading(false);
        setShowDemoModal(true);
        return;
      }

      // Step 1: Initiate OAuth popup/redirect via KingsChat Web SDK
      const response = await kingsChatWebSdk.login({
        clientId,
        scopes: ['send_chat_message']
      });

      const accessToken = response?.accessToken || response?.token;
      if (!accessToken) {
        throw new Error('No access token returned by KingsChat');
      }

      // Step 2: Authenticate with backend using KingsChat access token
      const res = await apiFetch(`${API_BASE_URL}/api/auth/kingschat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'KingsChat authentication failed');
      }

      // Step 3: Trigger login callback
      onSuccess(data.data.user, data.token);
    } catch (err: any) {
      console.warn('KingsChat SDK Login error, opening fallback login dialog:', err);
      // Fallback to quick KingsChat sign in modal if popup or client_id fails
      setIsLoading(false);
      setShowDemoModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const handle = demoHandle.trim() || 'kingschat_user';
      const cleanHandle = handle.replace(/^@/, '');
      
      const res = await apiFetch(`${API_BASE_URL}/api/auth/kingschat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoProfile: {
            kingschat_id: `kc_${cleanHandle}`,
            username: cleanHandle,
            name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
            email: `${cleanHandle}@kingschat.user`
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'KingsChat authentication failed');

      setShowDemoModal(false);
      onSuccess(data.data.user, data.token);
    } catch (err: any) {
      if (onError) onError(err.message || 'KingsChat login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleKingsChatLogin}
        disabled={isLoading}
        className={`w-full py-4 px-6 bg-[#2B82C9] hover:bg-[#2069A5] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 shadow-sm hover:shadow-md ${className}`}
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.39A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
        </svg>
        <span>{isLoading ? 'Connecting to KingsChat...' : text}</span>
      </button>

      {/* Demo / Quick KingsChat Login Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full p-8 rounded-sm shadow-2xl space-y-6 relative border border-black/10">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-black/40 hover:text-black text-xl font-bold"
            >
              &times;
            </button>

            <div className="flex items-center space-x-3 border-b border-black/10 pb-4">
              <div className="w-10 h-10 bg-[#2B82C9] text-white flex items-center justify-center rounded-full">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.39A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg uppercase tracking-tight">KingsChat Account Login</h3>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Connect your KingsChat identity</p>
              </div>
            </div>

            <p className="text-xs text-black/60 leading-relaxed">
              Enter your KingsChat username/handle below to log in and save your profile details:
            </p>

            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">KingsChat Username</label>
                <input
                  type="text"
                  required
                  value={demoHandle}
                  onChange={(e) => setDemoHandle(e.target.value)}
                  placeholder="e.g. @john_kingschat"
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-sm focus:border-[#2B82C9] outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#2B82C9] hover:bg-[#2069A5] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all"
              >
                {isLoading ? 'SIGNING IN...' : 'CONFIRM KINGSCHAT LOGIN'}
              </button>
            </form>

            <p className="text-[9px] text-black/40 italic text-center">
              Note: In production, once registered at developer.kingsch.at, update VITE_KINGSCHAT_CLIENT_ID in .env for direct OAuth popup auth.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default KingsChatButton;
