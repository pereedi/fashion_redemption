import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../config/api';

interface KingsChatButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError?: (errorMessage: string) => void;
  text?: string;
  className?: string;
}

/**
 * KingsChatButton
 *
 * Implements KingsChat OAuth2 flow per developer documentation:
 *  1. Opens accounts.kingschat.online/log-in?clientId=...&origin=SESSION_STATE in a popup window.
 *  2. KingsChat POSTs the authorization code to our server's registered redirect_url.
 *  3. Server exchanges the code for tokens, retrieves user profile, and stores session.
 *  4. Client polls /api/auth/kingschat/poll?state=... (and listens for postMessage) to complete login.
 */
const KingsChatButton: React.FC<KingsChatButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with KingsChat',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const listenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clientId = import.meta.env.VITE_KINGSCHAT_CLIENT_ID;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('message', listenerRef.current);
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const cleanup = () => {
    if (listenerRef.current) {
      window.removeEventListener('message', listenerRef.current);
      listenerRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsLoading(false);
  };

  const handleKingsChatLogin = () => {
    if (!clientId || clientId === 'your_kingschat_client_id') {
      if (onError) {
        onError(
          'KingsChat Client ID is not configured. Please set VITE_KINGSCHAT_CLIENT_ID in your .env file after registering at developer.kingsch.at'
        );
      }
      return;
    }

    setIsLoading(true);

    // Generate a unique session state to correlate backend callback with this client session
    const stateId = `kc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Build URL according to Step 4 of the KingsChat Developer Documentation
    const loginUrl =
      `https://accounts.kingschat.online/log-in` +
      `?clientId=${encodeURIComponent(clientId)}` +
      `&origin=${encodeURIComponent(stateId)}`;

    // Open a centered popup
    const width = 520;
    const height = 640;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      loginUrl,
      'KingsChatLogin',
      `width=${width},height=${height},left=${left},top=${top},` +
        `scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      cleanup();
      if (onError) {
        onError(
          'Popup was blocked. Please allow popups for this site and try again.'
        );
      }
      return;
    }

    popupRef.current = popup;

    const handleSuccess = (user: any, token: string) => {
      cleanup();
      try {
        popupRef.current?.close();
      } catch (e) {}
      onSuccess(user, token);
    };

    const handleError = (errMsg: string) => {
      cleanup();
      try {
        popupRef.current?.close();
      } catch (e) {}
      if (onError) onError(errMsg || 'KingsChat authentication failed');
    };

    // 1. Listen for postMessage result (in case browser directly redirects back)
    const messageHandler = (event: MessageEvent) => {
      const { type, token, user, message: errMsg } = event.data || {};
      if (type === 'KINGSCHAT_AUTH_SUCCESS' && token && user) {
        handleSuccess(user, token);
      } else if (type === 'KINGSCHAT_AUTH_ERROR') {
        handleError(errMsg);
      }
    };

    listenerRef.current = messageHandler;
    window.addEventListener('message', messageHandler);

    // 2. Poll server for auth completion (for KingsChat backend webhook POST flow)
    const pollStartTime = Date.now();
    pollRef.current = setInterval(async () => {
      // Timeout after 3 minutes
      if (Date.now() - pollStartTime > 180000) {
        cleanup();
        try { popupRef.current?.close(); } catch (e) {}
        return;
      }

      // Check if popup was manually closed by user
      if (popupRef.current?.closed) {
        cleanup();
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/kingschat/poll?state=${encodeURIComponent(stateId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.token && data.data?.user) {
            handleSuccess(data.data.user, data.token);
          } else if (data.status === 'error') {
            handleError(data.message);
          }
        }
      } catch (err) {
        // Continue polling on transient network glitches
      }
    }, 1200);
  };

  return (
    <button
      type="button"
      id="kingschat-login-btn"
      onClick={handleKingsChatLogin}
      disabled={isLoading}
      className={`w-full py-4 px-6 bg-[#2B82C9] hover:bg-[#2069A5] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 shadow-sm hover:shadow-md ${className}`}
    >
      {/* KingsChat Chat Bubble Icon */}
      <svg
        className="w-5 h-5 fill-current flex-shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.39A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
      </svg>

      <span>
        {isLoading ? 'Opening KingsChat...' : text}
      </span>

      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
    </button>
  );
};

export default KingsChatButton;