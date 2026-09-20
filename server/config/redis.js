const { createClient } = require('redis');

let redisClient = null;

const DEFAULT_TTL = parseInt(process.env.REDIS_CACHE_TTL, 10) || 300; // 5 minutes default TTL

/**
 * Initialize and connect the Redis client.
 * Connects using process.env.REDIS_URL with graceful error handling.
 */
const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.warn('[Redis] REDIS_URL not configured. Redis caching will be bypassed.');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.error('[Redis Client Error]:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error(`[Redis] Connection failed: ${error.message}. Running without Redis cache.`);
    return null;
  }
};

/**
 * Generate a cache key based on the user ID and query parameters.
 * When query params are empty or default, returns `tasks:user:${userId}`.
 */
const getTaskCacheKey = (userId, query = {}) => {
  if (!userId) return null;

  const hasCustomQuery = Object.keys(query).some(k => {
    const val = query[k];
    if (k === 'page' && (val === '1' || val === 1)) return false;
    if (k === 'limit' && (val === '5' || val === 5)) return false;
    if (k === 'status' && val === 'All') return false;
    if (k === 'sort' && val === 'latest') return false;
    if (k === 'search' && !val) return false;
    return Boolean(val);
  });

  if (!hasCustomQuery) {
    return `tasks:user:${userId}`;
  }

  const queryString = Object.keys(query)
    .sort()
    .filter(k => query[k] !== undefined && query[k] !== '')
    .map(k => `${k}=${query[k]}`)
    .join('&');

  return `tasks:user:${userId}:${queryString}`;
};

/**
 * Safely retrieve parsed JSON from Redis cache.
 * Returns null on cache miss, when Redis is unavailable, or on parse error.
 */
const getCache = async (key) => {
  try {
    if (!key || !redisClient || !redisClient.isOpen) return null;
    const raw = await redisClient.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[Redis] getCache error for key "${key}":`, error.message);
    return null;
  }
};

/**
 * Safely serialize and store a JSON value in Redis with TTL.
 * Returns true if successful, false otherwise.
 */
const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    if (!key || !redisClient || !redisClient.isOpen) return false;
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, { EX: ttl });
    return true;
  } catch (error) {
    console.error(`[Redis] setCache error for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Invalidate all task cache entries for a given user ID.
 * Scans and deletes `tasks:user:${userId}*` keys.
 */
const clearUserTaskCache = async (userId) => {
  try {
    if (!userId || !redisClient || !redisClient.isOpen) return;
    const userIdStr = userId.toString();
    const pattern = `tasks:user:${userIdStr}*`;
    const keys = [];

    for await (const chunk of redisClient.scanIterator({ MATCH: pattern })) {
      if (Array.isArray(chunk)) {
        keys.push(...chunk);
      } else if (chunk) {
        keys.push(chunk);
      }
    }

    // Ensure exact base key is also included
    keys.push(`tasks:user:${userIdStr}`);

    const uniqueKeys = [...new Set(keys)];
    if (uniqueKeys.length > 0) {
      await redisClient.del(uniqueKeys);
      console.log(`[Redis] Invalidated cache for user ${userIdStr} (${uniqueKeys.length} key(s) removed)`);
    }
  } catch (error) {
    console.error(`[Redis] clearUserTaskCache error for user "${userId}":`, error.message);
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
  getTaskCacheKey,
  getCache,
  setCache,
  clearUserTaskCache,
  DEFAULT_TTL
};
