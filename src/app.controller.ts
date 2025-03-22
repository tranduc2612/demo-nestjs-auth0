import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/auth.guard';
import { RedisService } from './redis/redis.service';

@Controller('profile')
export class AppController {
  constructor(private readonly appService: AppService,private readonly redisService: RedisService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('set')
  async setCache() {
    await this.redisService.set('greeting', 'Hello Redis!', 60);
    return { message: 'Data saved to Redis' };
  }

  @Get('get')
  async getCache() {
    const value = await this.redisService.get<string>('greeting');
    return { value };
  }

  @Delete('delete')
  async deleteCache() {
    await this.redisService.del('room1');
    return { message: 'Data deleted from Redis' };
  }
}
