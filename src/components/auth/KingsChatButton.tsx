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

  const handleKingsChatLogin = async () => {
    const clientId = import.meta.env.VITE_KINGSCHAT_CLIENT_ID || 'your_kingschat_client_id';

    if (!clientId || clientId === 'your_kingschat_client_id') {
      console.warn('KingsChat Client ID is not configured in environment variables.');
    }

    setIsLoading(true);

    try {
      // Step 1: Initiate OAuth popup/redirect via KingsChat Web SDK
      const response = await kingsChatWebSdk.login({
        clientId,
        scopes: ['send_chat_message']
      });

      const accessToken = response?.accessToken || response?.token;
      if (!accessToken) {
        throw new Error('No access token received from KingsChat');
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
      console.error('KingsChat Login Error:', err);
      const errMsg = err?.message || 'KingsChat login failed. Please try again.';
      if (onError) {
        onError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

export default KingsChatButton;
