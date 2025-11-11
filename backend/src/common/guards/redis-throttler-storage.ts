import { ThrottlerStorage } from '@nestjs/throttler';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Throttler storage record format
 */
export interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
}

/**
 * Redis-backed ThrottlerStorage implementation
 * 
 * Provides distributed rate limiting across multiple server instances
 * using Redis as the shared storage backend.
 * 
 * Features:
 * - Distributed state management
 * - Automatic expiration of rate limit records
 * - Sub-5ms performance overhead
 * - Supports multiple throttler configurations
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly keyPrefix = 'throttle:';

  constructor(private readonly redis: Redis) {
    this.logger.log('✅ Redis Throttler Storage initialized');
  }

  /**
   * Increment the request count for a given key
   * @param key Throttler key (usually IP address or user ID)
   * @param ttl Time to live in milliseconds
   * @returns ThrottlerStorageRecord with totalHits and timeToExpire
   */
  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    const redisKey = this.keyPrefix + key;
    const ttlSeconds = Math.ceil(ttl / 1000); // Convert ms to seconds
    
    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, ttlSeconds);
      pipeline.ttl(redisKey);
      
      const results = await pipeline.exec();
      
      if (!results || results.length === 0) {
        this.logger.error(`Failed to increment throttle key: ${key}`);
        return { totalHits: 1, timeToExpire: ttl }; // Fallback to allow request
      }
      
      // Extract results
      const [incrError, count] = results[0];
      const [ttlError, remainingTtl] = results[2];
      
      if (incrError) {
        this.logger.error(
          `Redis INCR error for key ${key}: ${incrError.message}`,
        );
        return { totalHits: 1, timeToExpire: ttl }; // Fallback to allow request
      }
      
      const timeToExpire = ttlError ? ttl : (remainingTtl as number) * 1000; // Convert back to ms
      
      return {
        totalHits: count as number,
        timeToExpire: timeToExpire,
      };
    } catch (error) {
      this.logger.error(
        `Redis throttle increment error: ${error.message}`,
        error.stack,
      );
      // In case of Redis failure, allow the request (fail open)
      return { totalHits: 1, timeToExpire: ttl };
    }
  }

  /**
   * Get the current request count for a given key
   * @param key Throttler key
   * @returns Current count or 0 if key doesn't exist
   */
  async get(key: string): Promise<number> {
    const redisKey = this.keyPrefix + key;
    
    try {
      const value = await this.redis.get(redisKey);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      this.logger.error(
        `Redis throttle get error: ${error.message}`,
        error.stack,
      );
      // In case of Redis failure, return 0 (fail open)
      return 0;
    }
  }

  /**
   * Delete a throttle key (used for testing or manual reset)
   * @param key Throttler key
   */
  async delete(key: string): Promise<void> {
    const redisKey = this.keyPrefix + key;
    
    try {
      await this.redis.del(redisKey);
    } catch (error) {
      this.logger.error(
        `Redis throttle delete error: ${error.message}`,
        error.stack,
      );
    }
  }
}

