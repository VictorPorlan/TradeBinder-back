import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async findAll(): Promise<Location[]> {
    return this.locationRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id, isActive: true },
    });
    
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    
    return location;
  }

  async findByName(name: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { name, isActive: true },
    });
    
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    
    return location;
  }

  async create(name: string, description?: string): Promise<Location> {
    const location = this.locationRepository.create({
      name,
      description,
      isActive: true,
    });
    return this.locationRepository.save(location);
  }

  async update(id: number, name?: string, description?: string): Promise<Location> {
    const location = await this.findOne(id);
    if (!location) {
      throw new Error('Location not found');
    }

    if (name) location.name = name;
    if (description !== undefined) location.description = description;

    return this.locationRepository.save(location);
  }

  async deactivate(id: number): Promise<void> {
    await this.locationRepository.update(id, { isActive: false });
  }

  async getLocationStats(): Promise<{ total: number; active: number; inactive: number }> {
    const total = await this.locationRepository.count();
    const active = await this.locationRepository.count({ where: { isActive: true } });
    const inactive = total - active;

    return { total, active, inactive };
  }
}
