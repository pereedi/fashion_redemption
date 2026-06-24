// Rate limits by tier
const TIERS = {
  // Your own frontend — generous limit, effectively unrestricted
  trusted: { windowMs: 15 * 60 * 1000, max: 2000 },
  // External API consumers (AI bot team, third parties)
  external: { windowMs: 15 * 60 * 1000, max: 100 },
};

// Trusted origins — your own frontend domains
const TRUSTED_ORIGINS = [
  'https://fashion-redemption.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const ipRequests = new Map();

// Periodic cleanup to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of ipRequests.entries()) {
    const active = data.timestamps.filter(t => now - t < Math.max(TIERS.trusted.windowMs, TIERS.external.windowMs));
    if (active.length === 0) {
      ipRequests.delete(key);
    } else {
      data.timestamps = active;
    }
  }
}, 5 * 60 * 1000);

// Get the real client IP — works correctly behind Render's proxy
const getRealIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list — first entry is the real client
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

export const rateLimiter = (req, res, next) => {
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  const isTrusted = TRUSTED_ORIGINS.some(o => origin.startsWith(o));
  const tier = isTrusted ? TIERS.trusted : TIERS.external;

  const ip = getRealIp(req);
  const key = `${ip}:${isTrusted ? 'trusted' : 'external'}`;
  const now = Date.now();

  if (!ipRequests.has(key)) {
    ipRequests.set(key, { timestamps: [] });
  }

  const data = ipRequests.get(key);
  data.timestamps = data.timestamps.filter(t => now - t < tier.windowMs);

  if (data.timestamps.length >= tier.max) {
    const oldestTimestamp = data.timestamps[0];
    const retryAfterMs = tier.windowMs - (now - oldestTimestamp);
    const retryAfterSecs = Math.ceil(retryAfterMs / 1000);

    res.set('Retry-After', String(retryAfterSecs));
    return res.status(429).json({
      success: false,
      message: `Too many requests. Please try again in ${Math.ceil(retryAfterSecs / 60)} minutes.`,
      retryAfter: retryAfterSecs,
    });
  }

  data.timestamps.push(now);
  next();
};