const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequestsPerWindow = 100;
const ipRequests = new Map();

// Periodic cleanup to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequests.entries()) {
    const active = timestamps.filter(t => now - t < rateLimitWindowMs);
    if (active.length === 0) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, active);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }

  const timestamps = ipRequests.get(ip);
  const active = timestamps.filter(t => now - t < rateLimitWindowMs);

  if (active.length >= maxRequestsPerWindow) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again after 15 minutes.'
    });
  }

  active.push(now);
  ipRequests.set(ip, active);
  next();
};
