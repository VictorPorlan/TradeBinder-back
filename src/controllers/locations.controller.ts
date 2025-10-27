import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LocationsService } from '../services/locations.service';
import { Location } from '../entities/location.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll(): Promise<Location[]> {
    return this.locationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Location> {
    return this.locationsService.findOne(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    return this.locationsService.getLocationStats();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body('name') name: string,
    @Body('description') description?: string,
  ): Promise<Location> {
    return this.locationsService.create(name, description);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name?: string,
    @Body('description') description?: string,
  ): Promise<Location> {
    return this.locationsService.update(id, name, description);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.locationsService.deactivate(id);
    return { message: 'Location deactivated successfully' };
  }
}
