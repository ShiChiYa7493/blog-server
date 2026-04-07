import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class StatsController {
  constructor(
    private statsService: StatsService,
    private configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  getStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('rss')
  async getRss(@Res() res: Response) {
    const siteUrl = this.configService.get('SITE_URL', 'http://1.116.119.240');
    const xml = await this.statsService.generateRss(siteUrl);
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }
}
