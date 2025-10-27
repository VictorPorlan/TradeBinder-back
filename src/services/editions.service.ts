import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Edition } from '../entities/edition.entity';
import { EditionResponseDto } from '../dto/editions.dto';

@Injectable()
export class EditionsService {
  constructor(
    @InjectRepository(Edition)
    private readonly editionRepository: Repository<Edition>,
  ) {}

  async findAll(): Promise<EditionResponseDto[]> {
    try {
      console.log('Finding editions...');
      const editions = await this.editionRepository.find({
        order: { name: 'ASC' },
      });
      console.log('Found editions:', editions.length);

      return editions.map(edition => {
        console.log('Processing edition:', edition.name);
        console.log('Release date type:', typeof edition.releaseDate);
        console.log('Release date value:', edition.releaseDate);
        
        return {
          id: edition.id,
          name: edition.name,
          releaseDate: edition.releaseDate && edition.releaseDate instanceof Date 
            ? edition.releaseDate.toISOString() 
            : edition.releaseDate ? String(edition.releaseDate) : undefined,
          hasFoil: edition.hasFoil,
          createdAt: edition.createdAt.toISOString(),
          updatedAt: edition.updatedAt.toISOString(),
        };
      });
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<EditionResponseDto> {
    const edition = await this.editionRepository.findOne({
      where: { id },
    });

    if (!edition) {
      throw new Error('Edition not found');
    }

    return {
      id: edition.id,
      name: edition.name,
      releaseDate: edition.releaseDate && edition.releaseDate instanceof Date 
        ? edition.releaseDate.toISOString() 
        : edition.releaseDate ? String(edition.releaseDate) : undefined,
      hasFoil: edition.hasFoil,
      createdAt: edition.createdAt.toISOString(),
      updatedAt: edition.updatedAt.toISOString(),
    };
  }
}
