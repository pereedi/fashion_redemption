import React, { useState, useEffect, useRef } from 'react';

interface KingsChatButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError?: (errorMessage: string) => void;
  text?: string;
  className?: string;
}

/**
 * KingsChatButton
 *
 * Implements the proper KingsChat OAuth2 popup flow:
 *  1. Opens accounts.kingschat.online/log-in?clientId=... in a popup window.
 *  2. KingsChat redirects to our /kingschat-callback page (registered as redirect_url).
 *  3. That callback page exchanges the `code` for tokens via our backend and
 *     posts the result back here via window.postMessage.
 *  4. We call onSuccess/onError accordingly.
 *
 * No more direct SDK login — that approach caused 422 errors because
 * kingschat-web-sdk was attempting a legacy password-based login flow,
 * not the OAuth2 authorization code flow.
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

    // Pass our frontend callback page as the `origin` — KingsChat echoes this back
    // in the POST body, and our server uses it to redirect the popup to the right URL.
    // The redirect_url registered in the KingsChat developer portal must be:
    //   https://your-backend-url.com/api/auth/kingschat/redirect
    const frontendCallbackUrl = `${window.location.origin}/kingschat-callback`;

    // Build the OAuth2 authorization URL
    const loginUrl =
      `https://accounts.kingschat.online/log-in` +
      `?clientId=${encodeURIComponent(clientId)}` +
      `&origin=${encodeURIComponent(frontendCallbackUrl)}`;

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

    // Listen for the postMessage result from the callback page
    const messageHandler = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;

      const { type, token, user, message: errMsg } = event.data || {};

      if (type === 'KINGSCHAT_AUTH_SUCCESS' && token && user) {
        cleanup();
        popupRef.current?.close();
        onSuccess(user, token);
      } else if (type === 'KINGSCHAT_AUTH_ERROR') {
        cleanup();
        popupRef.current?.close();
        if (onError) onError(errMsg || 'KingsChat authentication failed');
      }
    };

    listenerRef.current = messageHandler;
    window.addEventListener('message', messageHandler);

    // Poll to detect if the user closed the popup without completing login
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        cleanup();
        // Don't call onError here — user simply closed the popup
      }
    }, 500);
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
