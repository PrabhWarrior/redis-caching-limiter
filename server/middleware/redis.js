import { redis } from "../app.js";
export const getCachedData = (key) => async (req, res, next) => {
  const data = await redis.get(key);

  if (data) {
    console.log("Get from cache");
    return res.json({
      products: JSON.parse(data),
    });
  }

  next();
};

export const rateLimiter =
  ({ limit = 20, timer = 60, key }) =>
  async (req, res, next) => {
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // or -> req.ip
    const clientIpKey = `${clientIp}:${key}:request_count`;
    const requestCount = await redis.incr(clientIpKey);

    console.log(clientIpKey, "clientIpKey")

    if (requestCount === 1) {
      await redis.expire(clientIpKey, timer);
    }

    const timeRemaining = await redis.ttl(clientIpKey);

    if (requestCount > limit)
      return res
        .status(429)
        .send(
          `Too many requests, please try again after ${timeRemaining} seconds`
        );

    next();
  };
