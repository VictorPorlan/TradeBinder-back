import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CardsService } from '../services/cards.service';
import { Card } from '../entities/card-base.entity';
import { SearchCardsDto } from '../dto/cards.dto';

describe('CardsService', () => {
  let service: CardsService;
  let repository: Repository<Card>;

  const mockCard: Card = {
    id: 1,
    name: 'Lightning Bolt',
    manaCost: '{R}',
    type: 'Instant',
    subtype: null,
    rarity: 'Common',
    text: 'Lightning Bolt deals 3 damage to any target.',
    flavorText: null,
    power: null,
    toughness: null,
    loyalty: null,
    imageUrl: 'https://example.com/lightning-bolt.jpg',
    artist: 'Christopher Rush',
    number: '161',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    listings: [],
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockCard], 1]),
    })),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    repository = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated cards', async () => {
      const searchDto: SearchCardsDto = {
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      const result = await service.findAll(searchDto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Lightning Bolt');
    });

    it('should apply name filter', async () => {
      const searchDto: SearchCardsDto = {
        name: 'Lightning',
        page: 1,
        limit: 20,
      };

      await service.findAll(searchDto);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCard);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Lightning Bolt');
    });

    it('should throw NotFoundException when card not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchCards', () => {
    it('should return cards matching search term', async () => {
      mockRepository.find.mockResolvedValue([mockCard]);

      const result = await service.searchCards('Lightning');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Lightning Bolt');
    });

    it('should return empty array for empty search term', async () => {
      const result = await service.searchCards('');

      expect(result).toHaveLength(0);
    });
  });

  describe('getCardStats', () => {
    it('should return card statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(95); // active

      const result = await service.getCardStats();

      expect(result).toEqual({
        total: 100,
        active: 95,
        inactive: 5,
      });
    });
  });
});
