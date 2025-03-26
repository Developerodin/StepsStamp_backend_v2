import redis from '../config/redisClient.js';

const OTP_LIMIT_KEY = 'otp_limit';
const OTP_COOLDOWN_KEY = 'otp_cooldown';

/**
 * Middleware to prevent OTP abuse
 */
export const otpRateLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    // Check cooldown (60 seconds restriction)
    const cooldown = await redis.get(`${OTP_COOLDOWN_KEY}:${ip}`);
    if (cooldown) {
      return res.status(429).json({ message: 'Please wait 60 seconds before requesting another OTP.' });
    }

    // Check request count in last 10 minutes
    const requestCount = await redis.get(`${OTP_LIMIT_KEY}:${ip}`);
    if (requestCount && requestCount >= 5) {
      return res.status(429).json({ message: 'Maximum 3 OTP requests allowed in 10 minutes.' });
    }

    // Increase OTP request count
    await redis.incr(`${OTP_LIMIT_KEY}:${ip}`);
    await redis.expire(`${OTP_LIMIT_KEY}:${ip}`, 100); // Expiry 10 minutes (600 sec)

    // Set cooldown for 60 seconds
    await redis.set(`${OTP_COOLDOWN_KEY}:${ip}`, '1', 'EX', 100);

    next();
  } catch (error) {
    console.error('❌ OTP Rate Limit Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
