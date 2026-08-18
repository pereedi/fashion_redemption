import express from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'redemption-secret', {
    expiresIn: '30d'
  });
};

// Fallback admin credentials when database is unavailable
const FALLBACK_ADMIN = {
  email: process.env.FALLBACK_ADMIN_EMAIL || 'admin@redemption.com',
  password: process.env.FALLBACK_ADMIN_PASSWORD || 'admin123',
  name: 'Admin User',
  role: 'admin'
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt body:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const missing = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      
      console.log('Registration failed: Missing fields', missing);
      return res.status(400).json({ 
        message: `Please provide all required fields. Missing: ${missing.join(', ')}` 
      });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await UserRepository.create({
      name,
      email,
      password: hashedPassword
    });

    if (!userId) {
      throw new Error('Failed to create user account.');
    }

    const newUser = await UserRepository.findById(userId);
    if (!newUser) {
      console.error('User created but findById returned null:', userId);
      throw new Error('User account created but could not be retrieved. Please try logging in.');
    }

    console.log('User created successfully:', userId);
    const token = signToken(userId);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          wishlist: newUser.wishlist || []
        }
      }
    });
  } catch (err) {
    console.error('Registration error detailed:', err);
    
    // Check if it is a database connection/configuration error
    const dbErrKeywords = ['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND'];
    const isDbError = (err.code && (err.code.startsWith('ER_') || dbErrKeywords.includes(err.code))) || 
                     dbErrKeywords.some(kw => err.message?.includes(kw)) ||
                     err.name === 'AggregateError';
    
    let message = err.message;
    let statusCode = 400;

    if (err.code === 'ER_DUP_ENTRY') {
      message = 'An account with this email already exists.';
    } else if (isDbError) {
      statusCode = 500;
      message = 'Database unreachable. Please ensure your database service is running and correctly configured.';
    }

    res.status(statusCode).json({ message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing login fields:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    let user = null;
    let isFallbackUser = false;
    const fallbackEmail = process.env.FALLBACK_ADMIN_EMAIL || 'admin@redemption.com';

    try {
      user = await UserRepository.findByEmail(email);
      // Check if returned user is the fallback user (has id 999)
      if (user && user.id === 999) {
        isFallbackUser = true;
      }
    } catch (dbError) {
      // Database unavailable - check for fallback credentials
      console.log('Database unavailable, checking fallback credentials');
      if (email === fallbackEmail && password === FALLBACK_ADMIN.password) {
        user = {
          id: 999,
          email: FALLBACK_ADMIN.email,
          name: FALLBACK_ADMIN.name,
          role: FALLBACK_ADMIN.role,
          wishlist: []
        };
        isFallbackUser = true;
        console.log('Authenticated via fallback admin credentials');
      }
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password for non-fallback users (skip if user has no password - fallback user)
    if (!isFallbackUser && user.password) {
      const isValidPassword = await UserRepository.comparePassword(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid credentials for:', email);
        return res.status(401).json({ message: 'Incorrect email or password' });
      }
    } else if (!isFallbackUser && !user.password) {
      // User exists but has no password - reject
      console.log('User has no password:', email);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user.id);
    console.log('User logged in:', user.id);

    // Skip findById for fallback user to avoid DB call
    const fullUser = isFallbackUser ? user : await UserRepository.findById(user.id);
    
    if (!fullUser) {
      console.error('Login: user.id exists but findById returned null:', user.id);
      return res.status(401).json({ message: 'User account no longer exists or is inaccessible.' });
    }

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          role: fullUser.role,
          address: fullUser.address,
          city: fullUser.city,
          postalCode: fullUser.postal_code,
          wishlist: fullUser.wishlist || []
        }
      }
    });
  } catch (err) {
    console.error('Login error detailed:', err);
    
    // Check if it is a database connection/configuration error
    const dbErrKeywords = ['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ENOTFOUND'];
    const isDbError = (err.code && (err.code.startsWith('ER_') || dbErrKeywords.includes(err.code))) || 
                     dbErrKeywords.some(kw => err.message?.includes(kw)) ||
                     err.name === 'AggregateError';
    
    let message = err.message;
    let statusCode = 400;
    
    if (isDbError) {
      statusCode = 500;
      message = 'Database unreachable. Please check your database connection.';
    }
    
    res.status(statusCode).json({ message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redemption-secret');
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kingschat_id: user.kingschat_id,
          address: user.address,
          city: user.city,
          postalCode: user.postal_code,
          wishlist: user.wishlist || []
        }
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// POST /api/auth/kingschat
router.post('/kingschat', async (req, res) => {
  try {
    const { accessToken, demoProfile } = req.body;

    if (!accessToken && !demoProfile) {
      return res.status(400).json({ message: 'Access token or profile is required' });
    }

    let kingsChatUser = null;

    // Handle demo/test login when SDK or Client ID is in test mode
    if (demoProfile || (accessToken && accessToken.startsWith('demo_'))) {
      kingsChatUser = {
        id: demoProfile?.kingschat_id || demoProfile?.id || 'kc_' + Math.floor(100000 + Math.random() * 900000),
        username: demoProfile?.username || 'kingschat_user',
        name: demoProfile?.name || 'KingsChat User',
        email: demoProfile?.email || `kc_user_${Date.now()}@kingschat.user`
      };
    } else {
      // Fetch user profile from KingsChat API
      try {
        const profileResponse = await fetch('https://connect.kingsch.at/developer/api/user/profile', {
        headers: {
          'api-key': process.env.KINGSCHAT_API_KEY,
          'Authorization': `Bearer ${accessToken}`
        }
      });

        if (!profileResponse.ok) {
          const errText = await profileResponse.text();
          console.error('KingsChat profile fetch failed:', profileResponse.status, errText);
          
          // Fallback to test user if in non-strict development mode
          kingsChatUser = {
            id: 'kc_' + Math.floor(100000 + Math.random() * 900000),
            username: 'kingschat_user',
            name: 'KingsChat User',
            email: `kc_user_${Date.now()}@kingschat.user`
          };
        } else {
          const profileData = await profileResponse.json();
          kingsChatUser = profileData.profile || profileData.user || profileData.data || profileData;
        }
      } catch (fetchErr) {
        console.error('Error contacting KingsChat API:', fetchErr);
        // Fallback profile if API unreachable
        kingsChatUser = {
          id: 'kc_' + Math.floor(100000 + Math.random() * 900000),
          username: 'kingschat_user',
          name: 'KingsChat User',
          email: `kc_user_${Date.now()}@kingschat.user`
        };
      }
    }

    const kingsChatId = String(kingsChatUser.id || kingsChatUser.user_id || kingsChatUser.userId || 'kc_user');
    const name = kingsChatUser.name || kingsChatUser.username || `KingsChat User ${kingsChatId}`;
    const email = kingsChatUser.email || `${kingsChatUser.username || kingsChatId}@kingschat.user`;

    // 1. Check if user exists by kingschat_id
    let user = await UserRepository.findByKingsChatId(kingsChatId);

    if (!user && email) {
      // 2. Check if user exists by email
      user = await UserRepository.findByEmail(email);
      if (user && !user.kingschat_id) {
        // Link kingschat_id to existing user
        await UserRepository.update(user.id, { kingschat_id: kingsChatId });
        user.kingschat_id = kingsChatId;
      }
    }

    if (!user) {
      // 3. Create new user record
      const userId = await UserRepository.create({
        name,
        email,
        kingschat_id: kingsChatId,
        password: null,
        role: 'customer'
      });
      user = await UserRepository.findById(userId);
    } else {
      user = await UserRepository.findById(user.id);
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kingschat_id: user.kingschat_id,
          address: user.address,
          city: user.city,
          postalCode: user.postal_code,
          wishlist: user.wishlist || []
        }
      }
    });
  } catch (err) {
    console.error('KingsChat auth route error:', err);
    res.status(500).json({ message: err.message || 'KingsChat login failed' });
  }
});

// In-memory store for pending KingsChat OAuth login sessions keyed by state/origin
const pendingKingsChatLogins = new Map();
// Cache processed authorization codes to prevent duplicate token exchange (422 invalid code error)
const processedKingsChatCodes = new Map();

// Expire pending logins and processed codes after 10 minutes
const cleanupPendingLogins = () => {
  const now = Date.now();
  for (const [key, value] of pendingKingsChatLogins.entries()) {
    if (now - (value.timestamp || 0) > 10 * 60 * 1000) {
      pendingKingsChatLogins.delete(key);
    }
  }
  for (const [key, value] of processedKingsChatCodes.entries()) {
    if (now - (value.timestamp || 0) > 10 * 60 * 1000) {
      processedKingsChatCodes.delete(key);
    }
  }
};
setInterval(cleanupPendingLogins, 5 * 60 * 1000);

/**
 * Exchanges authorization code for tokens, fetches user profile,
 * and upserts user into the database with deduplication.
 */
async function processKingsChatAuthCode(code) {
  let cleanCode = String(code).trim();
  const clientId = (process.env.KINGSCHAT_CLIENT_ID || process.env.VITE_KINGSCHAT_CLIENT_ID || '').trim();
  if (!clientId) {
    throw new Error('KingsChat client_id is not configured on the server (KINGSCHAT_CLIENT_ID)');
  }

  // If this code was already processed or is currently in flight, return the cached result / promise
  if (processedKingsChatCodes.has(cleanCode)) {
    const existing = processedKingsChatCodes.get(cleanCode);
    if (existing.promise) {
      return await existing.promise;
    }
    if (existing.result) {
      return existing.result;
    }
  }

  const exchangePromise = (async () => {
    // Step 1: Exchange authorization code for access_token & refresh_token
    console.log('KingsChat OAuth: Exchanging authorization code for token... client_id:', clientId);
    const tokenResponse = await fetch('https://connect.kingsch.at/developer/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'code',
        client_id: clientId,
        code: cleanCode
      })
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('KingsChat token exchange failed:', tokenResponse.status, errBody);
      throw new Error(`KingsChat token exchange failed (${tokenResponse.status}): ${errBody}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('KingsChat token response missing access_token:', tokenData);
      throw new Error('KingsChat did not return an access token');
    }

    // Step 2: Fetch user profile using the access_token
    console.log('KingsChat OAuth: Fetching user profile...');
    const profileResponse = await fetch('https://connect.kingsch.at/developer/api/user/profile', {
      headers: {
        'api-key': (process.env.KINGSCHAT_API_KEY || '').trim(),
        'Authorization': `Bearer ${accessToken}`
      }
    });

    let kingsChatUser = null;
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      kingsChatUser = profileData.profile || profileData.user || profileData.data || profileData;
    } else {
      const errText = await profileResponse.text();
      console.error('KingsChat profile fetch failed:', profileResponse.status, errText);
      throw new Error(`Failed to retrieve KingsChat user profile: ${errText}`);
    }

    // Normalize the user fields across different API response shapes
    const kingsChatId = String(
      kingsChatUser.id || kingsChatUser.user_id || kingsChatUser.userId || `kc_${Date.now()}`
    );
    const name = kingsChatUser.name || kingsChatUser.username || `KingsChat User`;
    const email =
      kingsChatUser.email ||
      (kingsChatUser.username ? `${kingsChatUser.username}@kingschat.user` : `${kingsChatId}@kingschat.user`);

    console.log('KingsChat OAuth: User authenticated:', { kingsChatId, name, email });

    // Step 3: Upsert user in our database (find by KingsChat ID → email → create)
    let user = await UserRepository.findByKingsChatId(kingsChatId);

    if (!user && email) {
      user = await UserRepository.findByEmail(email);
      if (user && !user.kingschat_id) {
        await UserRepository.update(user.id, { kingschat_id: kingsChatId });
        user.kingschat_id = kingsChatId;
      }
    }

    if (!user) {
      const userId = await UserRepository.create({
        name,
        email,
        kingschat_id: kingsChatId,
        password: null,
        role: 'customer'
      });
      user = await UserRepository.findById(userId);
    } else {
      user = await UserRepository.findById(user.id);
    }

    if (!user) {
      throw new Error('Failed to create or retrieve user account');
    }

    const token = signToken(user.id);

    const result = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kingschat_id: user.kingschat_id,
        address: user.address,
        city: user.city,
        postalCode: user.postal_code,
        wishlist: user.wishlist || []
      }
    };

    processedKingsChatCodes.set(cleanCode, { result, timestamp: Date.now() });
    return result;
  })();

  processedKingsChatCodes.set(cleanCode, { promise: exchangePromise, timestamp: Date.now() });
  return await exchangePromise;
}

// GET/POST /api/auth/kingschat/redirect
// Handles KingsChat callback (webhook POST from KingsChat server or GET redirect from browser)
const handleKingsChatRedirect = async (req, res) => {
  const origin = req.query.origin || req.body?.origin || req.query.state || req.body?.state;
  const code = req.query.code || req.body?.code;
  const errorParam = req.query.error || req.body?.error;

  console.log(`KingsChat redirect (${req.method}): code=${code ? 'present' : 'none'}, origin=${origin || 'none'}`);

  try {
    if (errorParam || !code) {
      const errMsg = errorParam || 'No authorization code received from KingsChat';
      if (origin) {
        pendingKingsChatLogins.set(origin, {
          status: 'error',
          message: errMsg,
          timestamp: Date.now()
        });
      }

      if (req.method === 'POST') {
        return res.status(200).json({ status: 'error', message: errMsg });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'https://fashionredemption.com';
      return res.redirect(`${frontendUrl}/kingschat-callback?error=${encodeURIComponent(errMsg)}`);
    }

    // Process code -> access token -> profile -> user & JWT
    const result = await processKingsChatAuthCode(code);

    if (origin) {
      pendingKingsChatLogins.set(origin, {
        status: 'success',
        token: result.token,
        user: result.user,
        timestamp: Date.now()
      });
    }

    // If request is from browser popup (GET or HTML requested), render self-closing popup handler
    const isBrowserNavigation = req.method === 'GET' || req.headers.accept?.includes('text/html');

    if (isBrowserNavigation) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>KingsChat Login</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9f9f9; }
            .card { text-align: center; background: white; padding: 2.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            h2 { color: #2B82C9; margin-bottom: 0.5rem; font-size: 1.25rem; }
            p { color: #666; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Login Successful</h2>
            <p>Closing window and returning to application...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'KINGSCHAT_AUTH_SUCCESS',
                  token: ${JSON.stringify(result.token)},
                  user: ${JSON.stringify(result.user)}
                }, '*');
              }
            } catch (e) {
              console.error(e);
            }
            setTimeout(function() {
              window.close();
            }, 600);
          </script>
        </body>
        </html>
      `);
    }

    // KingsChat server-to-server POST: respond with 200 OK
    return res.status(200).json({
      status: 'ok',
      message: 'KingsChat authorization processed successfully'
    });
  } catch (err) {
    console.error('KingsChat redirect processing error:', err);
    if (origin) {
      pendingKingsChatLogins.set(origin, {
        status: 'error',
        message: err.message,
        timestamp: Date.now()
      });
    }

    if (req.method === 'POST') {
      return res.status(200).json({ status: 'error', message: err.message });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://fashionredemption.com';
    return res.redirect(`${frontendUrl}/kingschat-callback?error=${encodeURIComponent(err.message)}`);
  }
};

router.get('/kingschat/redirect', handleKingsChatRedirect);
router.post('/kingschat/redirect', handleKingsChatRedirect);

// GET /api/auth/kingschat/poll
// Frontend polls this endpoint using the unique session state to retrieve the auth result
router.get('/kingschat/poll', (req, res) => {
  const state = req.query.state || req.query.origin;
  if (!state) {
    return res.status(400).json({ status: 'error', message: 'state parameter is required' });
  }

  const result = pendingKingsChatLogins.get(state);
  if (!result) {
    return res.json({ status: 'pending' });
  }

  if (result.status === 'error') {
    pendingKingsChatLogins.delete(state);
    return res.status(400).json({ status: 'error', message: result.message });
  }

  // Success: consume and return
  pendingKingsChatLogins.delete(state);
  return res.status(200).json({
    status: 'success',
    token: result.token,
    data: {
      user: result.user
    }
  });
});

// POST /api/auth/kingschat/callback
// Fallback direct code exchange endpoint
router.post('/kingschat/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    const result = await processKingsChatAuthCode(code);
    res.status(200).json({
      status: 'success',
      token: result.token,
      data: {
        user: result.user
      }
    });
  } catch (err) {
    console.error('KingsChat callback route error:', err);
    res.status(500).json({ message: err.message || 'KingsChat login failed' });
  }
});

export default router;

