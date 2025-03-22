import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {
    // Tạo một subscriber riêng biệt
    this.subscriber = new Redis({
      host: 'localhost',
      port: 6379,
    });

    this.subscriber.on('error', (err) => {
      console.error('Redis Subscriber Error:', err);
    });
  }

  async set(key: string, value: any, ttl?: number) {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.set(key, data, 'EX', ttl);
    } else {
      await this.redisClient.set(key, data);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }

  async publish(channel: string, message: any) {
    await this.redisClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });
  }

  async unsubscribe(channel: string) {
    await this.subscriber.unsubscribe(channel);
  }

  onModuleInit() {
    console.log('RedisService initialized');
  }

  onModuleDestroy() {
    console.log('Closing Redis connections...');
    this.redisClient.quit();
    this.subscriber.quit();
  }
}
