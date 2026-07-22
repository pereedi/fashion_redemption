import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

/**
 * KingsChatCallbackPage
 *
 * This page is loaded inside the OAuth popup window when KingsChat redirects
 * back after a successful login. KingsChat POSTs an authorization code to
 * your registered redirect_url. Because we use a popup (window.open), we
 * redirect the popup to this page after the backend receives the POST,
 * OR we handle the GET redirect with the code in the query string
 * (depending on how the redirect_url is set up).
 *
 * Flow supported here:
 *  - This page sits at /kingschat-callback
 *  - It reads the `code` and optional `origin` from the URL query params
 *    (set by our server's redirect after exchanging the code).
 *  - It posts the result back to window.opener via postMessage.
 *  - The parent LoginPage listens for that message and completes login.
 */

const KingsChatCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing KingsChat login...');

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const origin = params.get('origin');
        const errorParam = params.get('error');

        if (errorParam) {
          throw new Error(`KingsChat login was cancelled or denied: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from KingsChat.');
        }

        setMessage('Verifying your KingsChat identity...');

        // Exchange the code for tokens via our backend
        const res = await fetch(`${API_BASE_URL}/api/auth/kingschat/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_REDEMPTION_API_KEY || ''
          },
          body: JSON.stringify({ code, origin })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'KingsChat authentication failed');
        }

        setStatus('success');
        setMessage('Login successful! Closing...');

        // Send success back to the opener window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'KINGSCHAT_AUTH_SUCCESS',
              token: data.token,
              user: data.data?.user
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 800);
        }
      } catch (err: any) {
        const errMsg = err.message || 'Authentication failed';
        setStatus('error');
        setMessage(errMsg);

        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'KINGSCHAT_AUTH_ERROR',
              message: errMsg
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 2000);
        }
      }
    };

    run();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        background: '#fff',
        padding: '2rem'
      }}
    >
      {/* KingsChat Blue logo-ish indicator */}
      <div
        style={{
          width: 56,
          height: 56,
          background: '#2B82C9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.39A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
        </svg>
      </div>

      {status === 'loading' && (
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid #2B82C9',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem'
          }}
        />
      )}

      {status === 'success' && (
        <div style={{ fontSize: 32, marginBottom: '1rem' }}>✅</div>
      )}
      {status === 'error' && (
        <div style={{ fontSize: 32, marginBottom: '1rem' }}>❌</div>
      )}

      <p
        style={{
          fontSize: 13,
          color: status === 'error' ? '#c0392b' : '#333',
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.6
        }}
      >
        {message}
      </p>

      <p style={{ fontSize: 11, color: '#999', marginTop: '0.75rem' }}>
        This window will close automatically.
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KingsChatCallbackPage;
